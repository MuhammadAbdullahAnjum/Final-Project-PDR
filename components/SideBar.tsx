import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useNavigation } from "expo-router";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next"; // Import the hook
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

interface SidebarMenuProps {
  visible: boolean;
  onClose: () => void;
  navigation?: any;
}

export default function SidebarMenu({ visible, onClose }: SidebarMenuProps) {
  const { t } = useTranslation(); // Initialize the translation function
  const { user, logout, isAuthenticated } = useAuth();
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const navigation = useNavigation();

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : -width,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleLogout = () => {
    Alert.alert(
      t("sidebar.signOutTitle"),
      t("sidebar.signOutMessage"),
      [
        { text: t("sidebar.cancel"), style: "cancel" },
        {
          text: t("sidebar.signOutTitle"),
          style: "destructive",
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              onClose();
            } else {
              Alert.alert(t("sidebar.errorTitle"), t("sidebar.signOutError"));
            }
          },
        },
      ]
    );
  };

  const handleMenuItemPress = (screen: string) => {
    console.log("Navigating to:", screen);
    onClose(); // Close the sidebar first
    setTimeout(() => {
      if (screen) {
        router.push(screen);
      }
    }, 150); // A short delay to prevent race conditions
  };

  const MenuItemButton = ({
    icon,
    title,
    onPress,
    iconColor = "#4ECDC4",
  }: {
    icon: any;
    title: string;
    onPress: () => void;
    iconColor?: string;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemIcon}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <ThemedText style={styles.menuItemText}>{title}</ThemedText>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  const getUserDisplayName = () => {
    if (!user) return t("sidebar.guestUser");
    return user.displayName || user.email || t("sidebar.anonymousUser");
  };

  const getUserEmail = () => {
    if (!user) return t("sidebar.notSignedIn");
    if (user.isAnonymous) return t("sidebar.guestAccount");
    return user.email || t("sidebar.noEmail");
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouch} onPress={onClose} />

        <Animated.View
          style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
        >
          <LinearGradient colors={["#4ECDC4", "#44A08D"]} style={styles.header}>
            <View style={styles.profileSection}>
              <View style={styles.profileAvatar}>
                <ThemedText style={styles.profileAvatarText}>
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.profileInfo}>
                <ThemedText style={styles.profileName}>
                  {getUserDisplayName()}
                </ThemedText>
                <ThemedText style={styles.profileEmail}>
                  {getUserEmail()}
                </ThemedText>
              </View>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>

          <ThemedView style={styles.menuContent}>
            {!isAuthenticated ? (
              <>
                <MenuItemButton
                  icon="log-in-outline"
                  title={t("sidebar.signIn")}
                  onPress={() => handleMenuItemPress("AuthScreen")}
                />
                <MenuItemButton
                  icon="person-add-outline"
                  title={t("sidebar.signUp")}
                  onPress={() => handleMenuItemPress("AuthScreen")}
                />
              </>
            ) : (
              <>
                <MenuItemButton
                  icon="person-outline"
                  title={t("sidebar.profile")}
                  onPress={() => handleMenuItemPress("Profile")}
                />
                <MenuItemButton
                  icon="settings-outline"
                  title={t("sidebar.settings")}
                  onPress={() => handleMenuItemPress("Settings")}
                />
                <MenuItemButton
                  icon="log-out-outline"
                  title={t("sidebar.signOutTitle")}
                  onPress={handleLogout}
                  iconColor="#FF6B6B"
                />
              </>
            )}
            <MenuItemButton
              icon="call-outline"
              title={t("sidebar.emergencyContacts")}
              onPress={() => handleMenuItemPress("Emergency")}
            />
            <MenuItemButton
              icon="call-outline"
              title={t("safetyScreen.title")}
              onPress={() => handleMenuItemPress("SafetyGuide")}
            />
          </ThemedView>

          <ThemedView style={styles.footer}>
            <ThemedText style={styles.footerText}>
              {t("sidebar.footerText")}
            </ThemedText>
          </ThemedView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flexDirection: "row",
  },
  overlayTouch: {
    flex: 1,
  },
  sidebar: {
    width: width * 0.85,
    maxWidth: 320,
    height: height,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    padding: 5,
  },
  menuContent: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuItemIcon: {
    width: 40,
    alignItems: "center",
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 15,
  },
  menuDivider: {
    height: 8,
    backgroundColor: "#F5F5F5",
    marginVertical: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    alignItems: "center",
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
  },
});
