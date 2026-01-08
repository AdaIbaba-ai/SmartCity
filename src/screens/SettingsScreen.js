import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../auth/AuthContext';

const SettingsScreen = () => {
  const { isLandscape } = useAppContext();
  const { selectedCity, setSelectedCity, theme, setTheme, language, setLanguage, swissCities } = useAppContext();
  const { user, logout } = useAuth();

  const showCityPicker = () => {
    Alert.alert(
      'Select City',
      'Choose your preferred Swiss city:',
      swissCities.map(city => ({
        text: `${city.name}`,
        onPress: () => setSelectedCity(city),
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    );
  };

  const showLanguagePicker = () => {
    const languages = [
      { code: 'en', name: 'English' },
      { code: 'de', name: 'Deutsch' },
      { code: 'fr', name: 'Français' },
      { code: 'it', name: 'Italiano' },
    ];

    Alert.alert(
      'Select Language',
      'Choose your preferred language:',
      languages.map(lang => ({
        text: lang.name,
        onPress: () => setLanguage(lang.code),
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    );
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const confirmLogout = () => {
    Alert.alert(
      'Sign out',
      'Do you really want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },

        {
          text: 'Sign out',
          style: 'destructive',
          onPress: () => {
            logout(); // AuthContext -> user=null -> Navigator zeigt Login
          },
        },
      ]
    );
  };

  const SettingItem = ({ title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || (onPress ? <Text style={styles.chevron}>›</Text> : null)}
    </TouchableOpacity>
  );

  const displayName = user?.username || 'Swiss Explorer';
  const displayEmail = user?.email || 'explorer@smartcity.ch';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileIcon}>
          <Text style={styles.profileIconText}>👤</Text>
        </View>
        <Text style={styles.profileName}>{displayName}</Text>
        <Text style={styles.profileEmail}>{displayEmail}</Text>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingsGroup}>
          <SettingItem
            title="Current City"
            subtitle={`${selectedCity.name}`}
            onPress={showCityPicker}
          />

          <SettingItem
            title="Language"
            subtitle={
              language === 'en'
                ? 'English'
                : language === 'de'
                ? 'Deutsch'
                : language === 'fr'
                ? 'Français'
                : language === 'it'
                ? 'Italiano'
                : language
            }
            onPress={showLanguagePicker}
          />

          <SettingItem
            title="Dark Mode"
            subtitle={theme === 'dark' ? 'Enabled' : 'Disabled'}
            rightComponent={
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={theme === 'dark' ? '#ffffff' : '#f3f4f6'}
              />
            }
          />

          <SettingItem
            title="Temperature Units"
            subtitle="Celsius (°C)"
            onPress={() =>
              Alert.alert('Coming Soon', 'Temperature unit selection will be available in a future update.')
            }
          />
        </View>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.settingsGroup}>
          <SettingItem
            title="Notifications"
            subtitle="Enabled"
            rightComponent={
              <Switch
                value={true}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor="#ffffff"
              />
            }
          />

          <SettingItem
            title="Location Access"
            subtitle="Enabled"
            rightComponent={<Text style={styles.checkmark}>✓</Text>}
          />

          <SettingItem
            title="Offline Maps"
            subtitle="Download for offline use"
            onPress={() => Alert.alert('Coming Soon', 'Offline maps will be available in a future update.')}
          />
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingsGroup}>
          <SettingItem title="Version" subtitle="1.0.0" rightComponent={null} />
          <SettingItem
            title="Privacy Policy"
            subtitle="How we protect your data"
            onPress={() =>
              Alert.alert('Privacy Policy', 'Your privacy is important to us. We collect minimal data and store it securely on your device.')
            }
          />
          <SettingItem
            title="Terms of Service"
            subtitle="App usage terms"
            onPress={() =>
              Alert.alert('Terms of Service', 'By using this app, you agree to our terms of service.')
            }
          />
          <SettingItem
            title="Support"
            subtitle="Get help with the app"
            onPress={() => Alert.alert('Support', 'For support, please email: support@smartcity.ch')}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ in Switzerland</Text>
        <Text style={styles.footerText}>SmartCity Switzerland © 2024</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  profileSection: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  profileIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 15,
  },
  profileIconText: { fontSize: 32, color: '#ffffff' },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  profileEmail: { fontSize: 14, color: '#6b7280' },

  logoutBtn: {
    marginTop: 14,
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  logoutText: { color: '#ffffff', fontWeight: '700' },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginLeft: 20, marginBottom: 10 },
  settingsGroup: { backgroundColor: '#ffffff', borderRadius: 10, marginHorizontal: 20, overflow: 'hidden' },

  settingItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '500', color: '#1f2937', marginBottom: 2 },
  settingSubtitle: { fontSize: 14, color: '#6b7280' },
  chevron: { fontSize: 18, color: '#9ca3af' },
  checkmark: { fontSize: 16, color: '#10b981', fontWeight: 'bold' },

  footer: { alignItems: 'center', padding: 30, marginTop: 20 },
  footerText: { fontSize: 12, color: '#9ca3af', marginBottom: 4 },
});

export default SettingsScreen;
