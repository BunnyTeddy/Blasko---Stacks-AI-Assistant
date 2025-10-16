// Re-export all tools from individual files
export { sendTokenTool } from './send-token';
export { multiSendTool } from './multi-send';
export { getTransactionTool } from './get-transaction';
export { getContractTool } from './get-contract';
export { getAccountTool } from './get-account';
export { swapTokenTool } from './swap-token';
export { getNftGalleryTool } from './get-nft-gallery';
export { bridgeTokenTool } from './bridge-token';
export { stackStxTool } from './stack-stx';
export { resolveBNSTool } from './resolve-bns';
export { reverseLookupBNSTool } from './reverse-lookup-bns';
export { registerBNSTool } from './register-bns';
export { getStacksTVLTool } from './get-stacks-tvl';
export { getTopProtocolsTool } from './get-top-protocols';
export { getDefiCategoriesTool } from './get-defi-categories';
export { getProtocolInfoTool } from './get-protocol-info';
export { getStacksKnowledgeTool } from './get-stacks-knowledge';

// Export tools object for the API route
import { sendTokenTool } from './send-token';
import { multiSendTool } from './multi-send';
import { getTransactionTool } from './get-transaction';
import { getContractTool } from './get-contract';
import { getAccountTool } from './get-account';
import { swapTokenTool } from './swap-token';
import { getNftGalleryTool } from './get-nft-gallery';
import { bridgeTokenTool } from './bridge-token';
import { stackStxTool } from './stack-stx';
import { resolveBNSTool } from './resolve-bns';
import { reverseLookupBNSTool } from './reverse-lookup-bns';
import { registerBNSTool } from './register-bns';
import { getStacksTVLTool } from './get-stacks-tvl';
import { getTopProtocolsTool } from './get-top-protocols';
import { getDefiCategoriesTool } from './get-defi-categories';
import { getProtocolInfoTool } from './get-protocol-info';
import { getStacksKnowledgeTool } from './get-stacks-knowledge';

export const tools = {
  sendToken: sendTokenTool,
  multiSend: multiSendTool,
  getTransaction: getTransactionTool,
  getContract: getContractTool,
  getAccount: getAccountTool,
  swapToken: swapTokenTool,
  getNftGallery: getNftGalleryTool,
  bridgeToken: bridgeTokenTool,
  stackStx: stackStxTool,
  resolveBNS: resolveBNSTool,
  reverseLookupBNS: reverseLookupBNSTool,
  registerBNS: registerBNSTool,
  getStacksTVL: getStacksTVLTool,
  getTopProtocols: getTopProtocolsTool,
  getDefiCategories: getDefiCategoriesTool,
  getProtocolInfo: getProtocolInfoTool,
  getStacksKnowledge: getStacksKnowledgeTool,
};

