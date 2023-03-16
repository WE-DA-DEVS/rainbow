import { useEffect, useMemo } from 'react';
import { ParsedAddressAsset, UniqueAsset } from '@/entities';
import { nftsQueryKey, useLegacyNFTs } from '@/resources/nfts';
import { useAccountSettings } from '.';
import { fetchSimpleHashNFT } from '@/resources/nfts/simplehash';
import { queryClient } from '@/react-query';
import { simpleHashNFTToUniqueAsset } from '@/resources/nfts/simplehash/utils';

export default function useCollectible(
  initialAsset: Partial<ParsedAddressAsset>,
  { revalidateInBackground = false } = {},
  externalAddress?: string
) {
  const { accountAddress } = useAccountSettings();
  const { data: selfNFTs } = useLegacyNFTs({ address: accountAddress });
  const { data: externalNFTs } = useLegacyNFTs({
    address: externalAddress ?? '',
  });
  const isExternal = Boolean(externalAddress);
  // Use the appropriate nfts based on if the user is viewing the
  // current account's nfts, or external nfts (e.g. ProfileSheet)
  const nfts = useMemo(() => (isExternal ? externalNFTs : selfNFTs), [
    externalNFTs,
    isExternal,
    selfNFTs,
  ]);

  const asset = useMemo(() => {
    const matched = nfts?.find(
      (nft: UniqueAsset) => nft.uniqueId === initialAsset?.uniqueId
    );
    return matched || initialAsset;
  }, [initialAsset, nfts]);

  useRevalidateInBackground({
    contractAddress: asset?.asset_contract?.address,
    enabled: revalidateInBackground && !isExternal,
    isExternal,
    tokenId: asset?.id!,
  });

  return { ...asset, isExternal };
}

function useRevalidateInBackground({
  contractAddress,
  tokenId,
  isExternal,
  enabled,
}: {
  contractAddress: string | undefined;
  tokenId: string;
  isExternal: boolean;
  enabled: boolean;
}) {
  const { accountAddress } = useAccountSettings();
  useEffect(() => {
    const updateNFT = async () => {
      const simplehashNFT = await fetchSimpleHashNFT(contractAddress!, tokenId);
      const updatedNFT =
        simplehashNFT && simpleHashNFTToUniqueAsset(simplehashNFT);

      if (updatedNFT) {
        queryClient.setQueryData(
          nftsQueryKey({ address: accountAddress }),
          (data: any) => ({
            ...data,
            pages: data.pages.map((page: any) =>
              page.map((nft: UniqueAsset) =>
                nft.uniqueId === updatedNFT.uniqueId ? updatedNFT : nft
              )
            ),
          })
        );
      }
    };
    // If `forceUpdate` is truthy, we want to force refresh the metadata from OpenSea &
    // update in the background. Useful for refreshing ENS metadata to resolve "Unknown ENS name".
    if (enabled && contractAddress && tokenId) {
      // Revalidate the updated asset in the background & update the `uniqueTokens` cache.
      updateNFT();
    }
  }, [accountAddress, contractAddress, enabled, tokenId]);
}
