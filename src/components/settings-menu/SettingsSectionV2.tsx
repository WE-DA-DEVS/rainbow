import lang from 'i18n-js';
import React, { useCallback, useMemo } from 'react';
import { Linking, ScrollView, Share } from 'react-native';
import { supportedLanguages } from '../../languages';
import AppVersionStamp from '../AppVersionStamp';
import MenuItem from './components/MenuItem';
import Menu from './components/Menu';
import BackupIcon from '@rainbow-me/assets/settingsBackup.png';
import BackupIconDark from '@rainbow-me/assets/settingsBackupDark.png';
import CurrencyIcon from '@rainbow-me/assets/settingsCurrency.png';
import CurrencyIconDark from '@rainbow-me/assets/settingsCurrencyDark.png';
import DarkModeIcon from '@rainbow-me/assets/settingsDarkMode.png';
import DarkModeIconDark from '@rainbow-me/assets/settingsDarkModeDark.png';
import LanguageIcon from '@rainbow-me/assets/settingsLanguage.png';
import LanguageIconDark from '@rainbow-me/assets/settingsLanguageDark.png';
import NetworkIcon from '@rainbow-me/assets/settingsNetwork.png';
import NetworkIconDark from '@rainbow-me/assets/settingsNetworkDark.png';
import NotificationsIcon from '@rainbow-me/assets/settingsNotifications.png';
import NotificationsIconDark from '@rainbow-me/assets/settingsNotificationsDark.png';
import PrivacyIcon from '@rainbow-me/assets/settingsPrivacy.png';
import PrivacyIconDark from '@rainbow-me/assets/settingsPrivacyDark.png';
import useExperimentalFlag, {
  LANGUAGE_SETTINGS,
} from '@rainbow-me/config/experimentalHooks';
import { Box, Divider, Stack } from '@rainbow-me/design-system';
import {
  isCustomBuild,
  setOriginalDeploymentKey,
} from '@rainbow-me/handlers/fedora';
import networkInfo from '@rainbow-me/helpers/networkInfo';
import WalletTypes from '@rainbow-me/helpers/walletTypes';
import {
  useAccountSettings,
  useSendFeedback,
  useWallets,
} from '@rainbow-me/hooks';
import { Themes, useTheme } from '@rainbow-me/theme';
import MenuContainer from './components/MenuContainer';

// const { RainbowRequestReview, RNReview } = NativeModules;

export const SettingsExternalURLs = {
  rainbowHomepage: 'https://rainbow.me',
  rainbowLearn: 'https://learn.rainbow.me',
  review:
    'itms-apps://itunes.apple.com/us/app/appName/id1457119021?mt=8&action=write-review',
  twitterDeepLink: 'twitter://user?screen_name=rainbowdotme',
  twitterWebUrl: 'https://twitter.com/rainbowdotme',
};

export interface SettingsSectionProps {
  onCloseModal: () => void;
  onPressBackup: () => void;
  onPressCurrency: () => void;
  onPressDev: () => void;
  onPressIcloudBackup: () => void;
  onPressLanguage: () => void;
  onPressNetwork: () => void;
  onPressPrivacy: () => void;
  onPressShowSecret: () => void;
  onPressTwitter: () => void;
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const checkAllWallets = (wallets: any) => {
  if (!wallets)
    return { allBackedUp: false, areBackedUp: false, canBeBackedUp: false };
  let areBackedUp = true;
  let canBeBackedUp = false;
  let allBackedUp = true;
  Object.keys(wallets).forEach(key => {
    if (!wallets[key].backedUp && wallets[key].type !== WalletTypes.readOnly) {
      allBackedUp = false;
    }

    if (
      !wallets[key].backedUp &&
      wallets[key].type !== WalletTypes.readOnly &&
      !wallets[key].imported
    ) {
      areBackedUp = false;
    }
    if (wallets[key].type !== WalletTypes.readOnly) {
      canBeBackedUp = true;
    }
  });
  return { allBackedUp, areBackedUp, canBeBackedUp };
};

export default function SettingsSectionV2({
  onCloseModal,
  onPressBackup,
  onPressCurrency,
  onPressDev,
  onPressIcloudBackup,
  onPressLanguage,
  onPressNetwork,
  onPressPrivacy,
  onPressShowSecret,
}: SettingsSectionProps) {
  const isReviewAvailable = false;
  const { wallets, isReadOnlyWallet } = useWallets();
  const {
    language,
    nativeCurrency,
    network,
    testnetsEnabled,
  } = useAccountSettings();
  const isLanguageSelectionEnabled = useExperimentalFlag(LANGUAGE_SETTINGS);

  const { colors, isDarkMode, setTheme, colorScheme } = useTheme();

  const onSendFeedback = useSendFeedback();

  // const onPressReview = useCallback(async () => {
  //   if (ios) {
  //     onCloseModal();
  //     RainbowRequestReview.requestReview((handled: boolean) => {
  //       if (!handled) {
  //         AsyncStorage.setItem(REVIEW_DONE_KEY, 'true');
  //         Linking.openURL(AppleReviewAddress);
  //       }
  //     });
  //   } else {
  //     RNReview.show();
  //   }
  // }, [onCloseModal]);

  const onPressShare = useCallback(() => {
    Share.share({
      message: `${lang.t('settings.hey_friend_message')} ${
        SettingsExternalURLs.rainbowHomepage
      }`,
    });
  }, []);

  const onPressTwitter = useCallback(async () => {
    Linking.canOpenURL(SettingsExternalURLs.twitterDeepLink).then(supported =>
      supported
        ? Linking.openURL(SettingsExternalURLs.twitterDeepLink)
        : Linking.openURL(SettingsExternalURLs.twitterWebUrl)
    );
  }, []);

  const onPressLearn = useCallback(
    () => Linking.openURL(SettingsExternalURLs.rainbowLearn),
    []
  );

  const { allBackedUp, areBackedUp, canBeBackedUp } = useMemo(
    () => checkAllWallets(wallets),
    [wallets]
  );

  const toggleTheme = useCallback(() => {
    if (colorScheme === Themes.SYSTEM) {
      setTheme(Themes.LIGHT);
    } else if (colorScheme === Themes.LIGHT) {
      setTheme(Themes.DARK);
    } else {
      setTheme(Themes.SYSTEM);
    }
  }, [setTheme, colorScheme]);
  return (
    <MenuContainer>
      <Menu>
        {canBeBackedUp && (
          <MenuItem
            hasRightArrow
            iconPadding="medium"
            leftComponent={
              <MenuItem.ImageIcon
                source={isDarkMode ? BackupIconDark : BackupIcon}
              />
            }
            onPress={onPressBackup}
            rightComponent={
              <MenuItem.StatusIcon
                colors={colors}
                status={
                  allBackedUp
                    ? 'complete'
                    : areBackedUp
                    ? 'incomplete'
                    : 'warning'
                }
              />
            }
            size="large"
            titleComponent={<MenuItem.Title text={lang.t('settings.backup')} />}
          />
        )}
        <MenuItem
          hasRightArrow
          iconPadding="medium"
          leftComponent={
            <MenuItem.ImageIcon
              source={isDarkMode ? NotificationsIconDark : NotificationsIcon}
            />
          }
          size="large"
          titleComponent={
            <MenuItem.Title text={lang.t('settings.notifications')} />
          }
        />
        <MenuItem
          hasRightArrow
          iconPadding="medium"
          leftComponent={
            <MenuItem.ImageIcon
              source={isDarkMode ? CurrencyIconDark : CurrencyIcon}
            />
          }
          onPress={onPressCurrency}
          rightComponent={
            <MenuItem.Selection>{nativeCurrency || ''}</MenuItem.Selection>
          }
          size="large"
          titleComponent={<MenuItem.Title text={lang.t('settings.currency')} />}
        />
        {(testnetsEnabled || IS_DEV) && (
          <MenuItem
            hasRightArrow
            iconPadding="medium"
            leftComponent={
              <MenuItem.ImageIcon
                source={isDarkMode ? NetworkIconDark : NetworkIcon}
              />
            }
            onPress={onPressNetwork}
            rightComponent={
              <MenuItem.Selection>
                {networkInfo?.[network]?.name}
              </MenuItem.Selection>
            }
            size="large"
            titleComponent={
              <MenuItem.Title text={lang.t('settings.network')} />
            }
          />
        )}
        <MenuItem
          hasRightArrow
          iconPadding="medium"
          leftComponent={
            <MenuItem.ImageIcon
              source={isDarkMode ? DarkModeIconDark : DarkModeIcon}
            />
          }
          onPress={toggleTheme}
          rightComponent={
            <MenuItem.Selection>
              {colorScheme ? capitalizeFirstLetter(colorScheme) : ''}
            </MenuItem.Selection>
          }
          size="large"
          titleComponent={<MenuItem.Title text={lang.t('settings.theme')} />}
        />
        {!isReadOnlyWallet && (
          <MenuItem
            hasRightArrow
            iconPadding="medium"
            leftComponent={
              <MenuItem.ImageIcon
                source={isDarkMode ? PrivacyIconDark : PrivacyIcon}
              />
            }
            onPress={onPressPrivacy}
            size="large"
            titleComponent={
              <MenuItem.Title text={lang.t('settings.privacy')} />
            }
          />
        )}
        {isLanguageSelectionEnabled && (
          <MenuItem
            hasRightArrow
            iconPadding="medium"
            leftComponent={
              <MenuItem.ImageIcon
                source={isDarkMode ? LanguageIconDark : LanguageIcon}
              />
            }
            onPress={onPressLanguage}
            rightComponent={
              <MenuItem.Selection>
                {(supportedLanguages as any)[language] || ''}
              </MenuItem.Selection>
            }
            size="large"
            titleComponent={
              <MenuItem.Title text={lang.t('settings.language')} />
            }
          />
        )}
      </Menu>
      <Menu>
        <MenuItem
          iconPadding="large"
          leftComponent={<MenuItem.EmojiIcon>🌈</MenuItem.EmojiIcon>}
          onPress={onPressShare}
          size="medium"
          titleComponent={
            <MenuItem.Title text={lang.t('settings.share_rainbow')} />
          }
        />
        <MenuItem
          iconPadding="large"
          leftComponent={<MenuItem.EmojiIcon>🧠</MenuItem.EmojiIcon>}
          onPress={onPressLearn}
          size="medium"
          titleComponent={<MenuItem.Title text={lang.t('settings.learn')} />}
        />
        <MenuItem
          iconPadding="large"
          leftComponent={<MenuItem.EmojiIcon>🐦</MenuItem.EmojiIcon>}
          onPress={onPressTwitter}
          size="medium"
          titleComponent={
            <MenuItem.Title text={lang.t('settings.follow_us_on_twitter')} />
          }
        />
        <MenuItem
          iconPadding="large"
          leftComponent={<MenuItem.EmojiIcon>💬</MenuItem.EmojiIcon>}
          onPress={onSendFeedback}
          size="medium"
          titleComponent={
            <MenuItem.Title
              text={lang.t(
                ios
                  ? 'settings.feedback_and_support'
                  : 'settings.feedback_and_reports'
              )}
            />
          }
        />
        {isReviewAvailable && (
          <MenuItem
            iconPadding="large"
            leftComponent={<MenuItem.EmojiIcon>❤️</MenuItem.EmojiIcon>}
            onPress={() => {}}
            size="medium"
            titleComponent={<MenuItem.Title text={lang.t('settings.review')} />}
          />
        )}
        {isCustomBuild.value && (
          <MenuItem
            iconPadding="large"
            leftComponent={<MenuItem.EmojiIcon>🤯</MenuItem.EmojiIcon>}
            onPress={setOriginalDeploymentKey}
            size="medium"
            titleComponent={
              <MenuItem.Title text={lang.t('settings.restore')} />
            }
          />
        )}
        <MenuItem
          iconPadding="large"
          leftComponent={
            <MenuItem.EmojiIcon>{ios ? '🚧' : '🐞'}</MenuItem.EmojiIcon>
          }
          onPress={onPressDev}
          size="medium"
          titleComponent={
            <MenuItem.Title text={lang.t('settings.developer')} />
          }
        />
      </Menu>
      <Box alignItems="center" width="full">
        <AppVersionStamp />
      </Box>
    </MenuContainer>
  );
}