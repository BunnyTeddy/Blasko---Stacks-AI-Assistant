'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Image as ImageIcon, ExternalLink, ChevronDown, Sparkles } from 'lucide-react';

type NftMetadata = {
  name?: string;
  imageUri?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
};

type Nft = {
  tokenId: string;
  assetId: string;
  blockHeight: number;
  metadata?: NftMetadata;
};

type Collection = {
  contractId: string;
  assetName: string;
  nfts: Nft[];
  metadata?: {
    name: string;
    description?: string;
    imageUri?: string;
  };
};

type NftGalleryProps = {
  address: string;
  totalNfts: number;
  collectionsCount: number;
  collections: Collection[];
};

export function NftGallery({ address, totalNfts, collectionsCount, collections }: NftGalleryProps) {
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

  const toggleCollection = (contractId: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(contractId)) {
      newExpanded.delete(contractId);
    } else {
      newExpanded.add(contractId);
    }
    setExpandedCollections(newExpanded);
  };

  const formatContractName = (contractId: string, assetName: string, metadata?: any) => {
    if (metadata?.name) return metadata.name;
    
    // Extract readable name from contract
    const parts = contractId.split('.');
    const contractName = parts[parts.length - 1] || assetName;
    
    // Convert kebab-case or snake_case to Title Case
    return contractName
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getImageUrl = (imageUri?: string) => {
    if (!imageUri) return null;
    
    // Handle IPFS URLs
    if (imageUri.startsWith('ipfs://')) {
      return imageUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    
    return imageUri;
  };

  const formatTokenId = (tokenId: string) => {
    // Clean up token ID formatting
    return tokenId.replace(/[u'()]/g, '');
  };

  return (
    <Card className="w-full max-w-4xl overflow-hidden flex flex-col max-h-[80vh]">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            NFT Collection
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">{totalNfts} NFTs</Badge>
            <Badge variant="outline">{collectionsCount} Collections</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {/* Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-muted p-2 rounded flex-1 break-all">
              {address}
            </code>
            <a
              href={`https://explorer.stacks.co/address/${address}?chain=mainnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 flex-shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Collections */}
        {collections.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No NFTs found in this wallet</p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {collections.map((collection) => {
              const isExpanded = expandedCollections.has(collection.contractId);
              
              return (
                <Collapsible
                  key={collection.contractId}
                  open={isExpanded}
                  onOpenChange={() => toggleCollection(collection.contractId)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          {collection.metadata?.imageUri && (
                            <img
                              src={getImageUrl(collection.metadata.imageUri) || ''}
                              alt={formatContractName(collection.contractId, collection.assetName, collection.metadata)}
                              className="w-10 h-10 rounded object-cover flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="text-left min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate">
                              {formatContractName(collection.contractId, collection.assetName, collection.metadata)}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {collection.contractId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge>{collection.nfts.length} NFTs</Badge>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-2">
                    <div className="p-4 bg-accent/20 rounded-lg">
                      {/* Description */}
                      {collection.metadata?.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {collection.metadata.description}
                        </p>
                      )}

                      {/* NFT Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {collection.nfts.map((nft, index) => {
                          const imageUrl = getImageUrl(nft.metadata?.imageUri);
                          const nftName = nft.metadata?.name || `#${formatTokenId(nft.tokenId)}`;

                          return (
                            <a
                              key={`${nft.assetId}-${index}`}
                              href={`https://gamma.io/collections/${collection.contractId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group"
                            >
                              <div className="aspect-square bg-muted rounded-lg overflow-hidden relative hover:ring-2 hover:ring-primary transition-all">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={nftName}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    onError={(e) => {
                                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23ccc"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23666" font-family="sans-serif">NFT</text></svg>';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                  <p className="text-xs text-white font-medium truncate">
                                    {nftName}
                                  </p>
                                </div>
                              </div>
                            </a>
                          );
                        })}
                      </div>

                      {/* View on Gamma.io */}
                      <a
                        href={`https://gamma.io/collections/${collection.contractId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mt-4"
                      >
                        View Collection on Gamma.io
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

