import React, { useCallback } from 'react';
import { UniqueTokenCard } from '../../unique-token';
import { Box, BoxProps } from '@rainbow-me/design-system';
import { UniqueAsset } from '@rainbow-me/entities';
import { useCollectible } from '@rainbow-me/hooks';
import { useNavigation } from '@rainbow-me/navigation';
import Routes from '@rainbow-me/routes';

export default React.memo(function WrappedNFT({
  onPress,
  uniqueId,
  placement,
  externalAddress,
}: {
  onPress?: (asset: UniqueAsset) => void;
  uniqueId: string;
  placement: 'left' | 'right';
  externalAddress?: string;
}) {
  const asset = useCollectible({ uniqueId }, undefined, externalAddress);

  const { navigate } = useNavigation();

  const handleItemPress = useCallback(
    asset =>
      navigate(Routes.EXPANDED_ASSET_SHEET, {
        asset,
        backgroundOpacity: 1,
        cornerRadius: 'device',
        external: asset?.isExternal || false,
        springDamping: 1,
        topOffset: 0,
        transitionDuration: 0.25,
        type: 'unique_token',
      }),
    [navigate]
  );

  const placementProps: BoxProps =
    placement === 'left'
      ? {
          alignItems: 'flex-start',
          paddingLeft: '19px',
        }
      : {
          alignItems: 'flex-end',
          paddingRight: '19px',
        };
  return (
    <Box
      flexGrow={1}
      justifyContent="center"
      testID={`wrapped-nft-${asset.name}`}
      {...placementProps}
    >
      <UniqueTokenCard item={asset} onPress={onPress || handleItemPress} />
    </Box>
  );
});
