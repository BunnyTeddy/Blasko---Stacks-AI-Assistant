import { tool as createTool } from 'ai';
import { z } from 'zod';

const API_KEY = process.env.HIRO_API_KEY;

export const getNftGalleryTool = createTool({
  description: 'Display user\'s NFT collection in a visual gallery with images. Use this when the user asks about "my NFTs", "show my NFTs", "my NFT collection", "NFT gallery", or anything specifically about viewing their NFTs.',
  inputSchema: z.object({
    address: z.string().describe('The Stacks address (starts with SP or ST). Use the connected wallet address from the system prompt when user asks about their own NFTs.'),
  }),
  execute: async function ({ address }) {
    if (!address) {
      throw new Error('No wallet address provided. Please connect your wallet first.');
    }

    try {
      // Fetch NFT holdings from Stacks API
      const holdingsResponse = await fetch(
        `https://api.hiro.so/extended/v1/tokens/nft/holdings?principal=${address}&limit=200`,
        {
          headers: {
            'Accept': 'application/json',
            'x-api-key': API_KEY,
          },
        }
      );

      if (!holdingsResponse.ok) {
        throw new Error(`Failed to fetch NFT holdings: ${holdingsResponse.statusText}`);
      }

      const holdingsData = await holdingsResponse.json();
      const nfts = holdingsData.results || [];

      // Group NFTs by collection
      const collectionMap = new Map();
      
      for (const nft of nfts) {
        const assetId = nft.asset_identifier;
        const [contractId, assetName] = assetId.split('::');
        
        if (!collectionMap.has(contractId)) {
          collectionMap.set(contractId, {
            contractId,
            assetName,
            nfts: [],
          });
        }
        
        collectionMap.get(contractId).nfts.push({
          tokenId: nft.value.repr,
          assetId: assetId,
          blockHeight: nft.block_height,
        });
      }

      // Convert to array and try to fetch metadata
      const collections = Array.from(collectionMap.values());
      
      // Try to fetch metadata for each collection from Token Metadata API
      for (const collection of collections) {
        try {
          const metadataResponse = await fetch(
            `https://api.hiro.so/metadata/v1/nft/${collection.contractId}`,
            {
              headers: {
                'Accept': 'application/json',
                'x-api-key': API_KEY,
              },
            }
          );

          if (metadataResponse.ok) {
            const metadata = await metadataResponse.json();
            collection.metadata = {
              name: metadata.name || collection.assetName,
              description: metadata.description,
              imageUri: metadata.image_uri || metadata.image_thumbnail_uri,
            };

            // Try to fetch individual NFT metadata
            for (const nft of collection.nfts.slice(0, 20)) { // Limit to first 20 for performance
              const tokenIdClean = nft.tokenId.replace(/[u'()]/g, '');
              
              try {
                const nftMetadataResponse = await fetch(
                  `https://api.hiro.so/metadata/v1/nft/${collection.contractId}/${tokenIdClean}`,
                  {
                    headers: {
                      'Accept': 'application/json',
                      'x-api-key': API_KEY,
                    },
                  }
                );

                if (nftMetadataResponse.ok) {
                  const nftMetadata = await nftMetadataResponse.json();
                  nft.metadata = {
                    name: nftMetadata.name,
                    imageUri: nftMetadata.image_uri || nftMetadata.image_thumbnail_uri || nftMetadata.image_canonical_uri,
                    attributes: nftMetadata.attributes || [],
                  };
                }
              } catch {
                // Skip if individual NFT metadata fails
                console.log(`Could not fetch metadata for NFT ${tokenIdClean}`);
              }
            }
          }
        } catch {
          console.log(`Could not fetch metadata for collection ${collection.contractId}`);
        }
      }

      return {
        address,
        totalNfts: nfts.length,
        collectionsCount: collections.length,
        collections,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch NFT gallery');
    }
  },
});



