# Ente Photos — Mobile (Flutter) Front-End Audit

**Subject:** `reference/ente/mobile/apps/photos` (Ente Photos, Flutter)
**Reference checkout:** `ente/ente` @ `d3839ab` (`reference/ente`, read-only, gitignored)
**Date of audit:** 2026-09-21

## Path shorthand used throughout

| Shorthand | Real path |
|---|---|
| `{APP}` | `reference/ente/mobile/apps/photos/lib` |
| `{PKG}` | `reference/ente/mobile/packages` |
| `{WEB}` | `reference/ente/web` |

All `path:line` citations below are relative to these roots. Every claim is
anchored to a file and line. Where a claim could not be established from the
source, it is written as **unverified**.

## Scope

In scope: `{APP}`, `{PKG}/ente_components`, `{PKG}/ui`, `{PKG}/strings`,
`{PKG}/feature_flag`, and `{WEB}/packages/gallery` (§11 only). Everything else
in `reference/ente` was ignored.

## Size of the surface

| Metric | Count | How measured |
|---|---|---|
| Dart files under `{APP}` | 1047 | `find . -name '*.dart' \| wc -l` |
| Dart files under `{APP}/ui` | 527 | same, under `ui/` |
| Files under `{APP}/ui` containing `Scaffold(` | 128 | `grep -rl "Scaffold(" ui/` |
| Classes named `*Page` / `*Screen` under `{APP}/ui` | 114 | `grep -rn "^class .*\(Page\|Screen\)\b.* extends \(StatefulWidget\|StatelessWidget\)"` |
| `show*` sheet/dialog entry functions under `{APP}/ui` | 56 | `grep -rn "^Future<.*> show[A-Z]\|^void show[A-Z]" ui/` |
| User-facing string keys in `{PKG}/strings` | 2142 | parsed `strings_en.arb` |
| Localisations shipped | 57 `.arb` files | `ls {PKG}/strings/lib/l10n/arb` |

## Correction to the brief

The brief states "Bottom nav with Home + Albums tabs". On this commit the app
ships **four** bottom-nav tabs — Home, Albums, Feed, Search — declared in
`{APP}/ui/home/home_bottom_nav_bar.dart:155-180` and mounted as four
`ExtentsPageView` children in `{APP}/ui/tabs/home_widget.dart:1060-1108`.
The audit below reflects four tabs.

---

# 1. SCREEN INVENTORY

"Screen" here = a widget that owns a full viewport (has its own `Scaffold` /
`SettingsPageScaffold` / `AppBarComponent` shell) and is reached by a route
push, a tab switch, or the app's `home:`. Bottom sheets and dialogs are **not**
listed here — they are in §3. All paths are relative to `{APP}`.

## 1.1 Shell / launch

| Screen | File path | Purpose | How you reach it |
|---|---|---|---|
| `EnteApp` (MaterialApp root) | `app.dart:33` | Theme + locale + navigator host; picks the initial home widget | Process start, `main.dart` |
| `HomeWidget` | `ui/tabs/home_widget.dart:92` | 4-tab shell: `Scaffold` with drawer + `ExtentsPageView` body + bottom nav | Default `home:` — `app.dart:156`, `app.dart:210` |
| `FileViewer` | `ui/viewer/actions/file_viewer.dart:25` | Standalone single-file viewer when Android launches the app with `IntentAction.view` on an image/video | `app.dart:153-154`, `app.dart:193` |
| `ExternalMediaPickerPage` | `ui/picker/external_media_picker_page.dart:34` | Ente acts as a system photo picker for another app | `app.dart:148`, `app.dart:183` (`IntentAction.pick`) |
| `WallpaperPage` | `ui/wallpaper/wallpaper_page.dart:39` | Separate `MaterialApp` entry for the set-wallpaper flow | `ui/wallpaper/wallpaper_page.dart:34` (own `home:`) |

## 1.2 Onboarding / gating (rendered inside the `HomeWidget` body, not pushed)

| Screen | File path | Purpose | How you reach it |
|---|---|---|---|
| `LandingPageWidget` | `ui/home/landing_page_widget.dart:27` | Signed-out landing: sign up / log in / continue without account | No configured account and not in local-gallery flow; `ui/tabs/home_widget.dart:1014` |
| `GrantPermissionsWidget` | `ui/home/grant_permissions_widget.dart:29` | Photo-library permission gate | `ui/tabs/home_widget.dart:1008`, `:1011`, `:1023` |
| `LoadingPhotosWidget` | `ui/home/loading_photos_widget.dart:24` | First-run "loading your photos" + backup folder pick | `ui/tabs/home_widget.dart:1026`; `ui/common/backup_flow_helper.dart:94` |

## 1.3 Tabs

| Screen | File path | Purpose | How you reach it |
|---|---|---|---|
| Home tab (`HomeGalleryWidget` + `HeaderWidget`) | `ui/home/home_gallery_widget.dart:29`, header `ui/home/header_widget.dart:15` | Main timeline gallery + status bar + memories strip + banners | Tab 0; `ui/tabs/home_widget.dart:1134-1136` |
| Albums tab (`AlbumsTab`) | `ui/tabs/albums_tab.dart:48` (1250 lines) | Albums with filter chips Ente / On device / Shared / Received, search, grid/list toggle | Tab 1; `ui/tabs/home_widget.dart:1076` |
| Feed tab (`FeedScreen`) | `ui/social/feed_screen.dart:83` | Social activity feed (likes / comments / shared-album activity) | Tab 2; `ui/tabs/home_widget.dart:100`, `:1084` |
| Search tab (`SearchTab`) | `ui/viewer/search_tab/search_tab.dart:32` | Search field + People / Magic / Locations / Contacts / File-type / Rituals / Wrapped sections | Tab 3; `ui/tabs/home_widget.dart:1087` |
| Settings drawer (`SettingsPage`) | `ui/settings_page.dart:44` | Root settings, hosted as the `Scaffold` drawer | `ui/tabs/home_widget.dart:891-900`; hamburger at `ui/components/home_header_widget.dart:30` |

## 1.4 Account / auth

| Screen | File path | Purpose | How you reach it |
|---|---|---|---|
| `EmailEntryPage` | `ui/account/email_entry_page.dart:16` | Sign-up email entry | `ui/settings_page.dart:90`; banners `ui/components/banners/get_started_banner.dart:215`, `save_faces_banner.dart:119`, `name_face_banner.dart:119`; `ui/social/widgets/feed_empty_state.dart:118` |
| `LoginPage` | `ui/account/login_page.dart:17` | Existing-account login | `ui/settings_page.dart:264`; `ui/account/email_entry_page.dart:483`; `ui/home/landing_page_widget.dart:255` |
| `LoginPasswordVerificationPage` | `ui/account/login_pwd_verification_page.dart:16` | SRP password step of login | `ui/account/login_page.dart:220` |
| `OTTVerificationPage` | `ui/account/ott_verification_page.dart:6` | Email one-time-token entry | `services/account/user_service.dart:132` |
| `PasswordEntryPage` | `ui/account/password_entry_page.dart:26` | Set / update / reset master password (`PasswordEntryMode`) | `ui/home/landing_page_widget.dart:233`, `:258`; `ui/account/recovery_page.dart:123`; `ui/settings/account/account_settings_page.dart:140` |
| `PasswordReentryPage` | `ui/account/password_reentry_page.dart:22` | Re-enter password on app relaunch | `ui/home/landing_page_widget.dart:235`, `:260`; `services/account/user_service.dart:391`, `:458` |
| `PasskeyPage` | `ui/account/passkey_page.dart:20` | Passkey second factor | `services/account/passkey_service.dart:37`; `services/account/user_service.dart:444`, `:725` |
| `TwoFactorAuthenticationPage` | `ui/account/two_factor_authentication_page.dart:10` | TOTP second factor at login | `ui/account/passkey_page.dart:220`; `services/account/user_service.dart:451`, `:732` |
| `TwoFactorRecoveryPage` | `ui/account/two_factor_recovery_page.dart:8` | Recover when 2FA device lost | `services/account/user_service.dart:897` |
| `TwoFactorSetupPage` | `ui/account/two_factor_setup_page.dart:16` | Enrol TOTP (QR + manual key) | `services/account/user_service.dart:1064` |
| `RecoveryPage` | `ui/account/recovery_page.dart:10` | Enter recovery key to reset password | `ui/account/password_reentry_page.dart:126`, `:256` |
| `RecoveryKeyPage` | `ui/account/recovery_key_page.dart:16` | Display / save the 24-word recovery key | `ui/account/password_entry_page.dart:418`; `ui/account/two_factor_setup_page.dart:262`; `ui/account/verify_recovery_page.dart:120`; `ui/settings/account/account_settings_page.dart:169` |
| `VerifyRecoveryPage` | `ui/account/verify_recovery_page.dart:19` | Confirm the user still has the recovery key | `ui/home/status_bar_widget.dart:208` (home banner) |
| `RequestPasswordVerificationPage` | `ui/account/request_pwd_verification_page.dart:15` | Re-auth before a sensitive security change | `ui/settings/security/security_settings_page.dart:207` |
| `SessionsPage` | `ui/account/sessions_page.dart:13` | List + terminate active sessions | `ui/settings/security/security_settings_page.dart:298` |

## 1.5 Gallery / viewer

| Screen | File path | Purpose | How you reach it |
|---|---|---|---|
| `DetailPage` | `ui/viewer/file/detail_page.dart:115` | Full-screen single-file viewer (`PageView` of files, app bar, bottom bar, optional filmstrip) | Tap a grid tile — `ui/viewer/gallery/component/gallery_file_widget.dart:302-322`; also `ui/social/feed_screen.dart:347`, `:371`, `:787`, `:837`, `:874` |
| `CollectionPage` | `ui/viewer/gallery/collection_page.dart:29` | One album's gallery | Album tap `ui/collections/album/vertical_list.dart`; search `ui/viewer/search/search_suggestions.dart:238`; file info `ui/viewer/file_details/albums_item_widget.dart:108`; feed `ui/social/feed_screen.dart:722` |
| `SharedPublicCollectionPage` | `ui/viewer/gallery/shared_public_collection_page.dart:34` | Public-link album opened in-app | Deep link handling in `ui/tabs/home_widget.dart:471`, `:502` |
| `ArchivePage` | `ui/viewer/gallery/archive_page.dart:28` | Archived items + archived albums | Albums tab → More sheet, `ui/tabs/albums/albums_manage_sheet.dart:82` |
| `HiddenPage` | `ui/viewer/gallery/hidden_page.dart:31` | Hidden items + hidden albums (auth-gated) | `ui/tabs/albums/albums_manage_sheet.dart:100` |
| `UnCategorizedPage` | `ui/viewer/gallery/uncategorized_page.dart:26` | Uncategorized collection | `ui/tabs/albums/albums_manage_sheet.dart:72` |
| `_TrashPage` (`showTrashPage`) | `ui/viewer/gallery/trash_page.dart:51`, opener `:35` | Trash gallery | `ui/tabs/albums/albums_manage_sheet.dart:108`; `ui/tabs/albums_tab.dart:1243` |
| `DeviceFolderPage` | `ui/viewer/gallery/device/device_folder_page.dart:27` | One on-device folder | `ui/collections/device/device_folder_row_item.dart:109`; `ui/viewer/search/search_suggestions.dart:252` |
| `SkippedDeviceFolderPage` | `ui/viewer/gallery/device/skipped_device_folder_page.dart:27` | Files skipped/ignored for upload in a device folder | `ui/viewer/gallery/device/device_folder_page.dart:153` |
| `DeviceFolderVerticalGridView` | `ui/collections/device/device_folders_vertical_grid_view.dart:26` | Grid of all on-device folders | Albums tab "On device" filter |
| `CollectionListPage` | `ui/collections/collection_list_page.dart:30` | Flat list of a set of collections (archived / hidden) | `ui/viewer/gallery/archive_page.dart:139`; `ui/viewer/gallery/hidden_page.dart:219` |
| `JumpToDateGallery` | `ui/viewer/gallery/jump_to_date_gallery.dart:30` | Timeline jumped to a file's date | `ui/viewer/file_details/creation_time_item_widget.dart:37`; `ui/viewer/people/memory_lane_page_v2.dart:978` |
| `LargeFilesPagePage` | `ui/viewer/gallery/large_files_page.dart:25` | Largest files, filterable All / Photos / Videos | `ui/settings/backup/free_space_options.dart:111` |
| `DeleteSuggestionsPage` | `ui/viewer/gallery/delete_suggestions_page.dart:17` | Files other members suggested for deletion | `ui/settings/backup/free_space_options.dart:222` |
| `CleanupHiddenFromDevicePage` | `ui/viewer/gallery/cleanup_hidden_from_device_page.dart:25` | Delete device copies of hidden files | `ui/viewer/gallery/cleanup_hidden_from_device_widget.dart:29` |
| `AlbumSlideshowPage` | `ui/viewer/album_slideshow/album_slideshow_page.dart:27` | Album slideshow player | `ui/viewer/album_slideshow/album_slideshow.dart:53` (album overflow → Slideshow) |
| `PanoramaViewerScreen` | `ui/viewer/file/panorama_viewer_screen.dart:19` | 360° photo viewer | `ui/viewer/file/detail_page.dart:561` |
| `MapScreen` | `ui/map/map_screen.dart:22` | Photos on a map with a pull-up gallery | Album overflow `ui/viewer/gallery/gallery_app_bar_widget.dart:1173`; file info `ui/viewer/file_details/location_tags_widget.dart:346`; search `ui/viewer/search/search_map_navigation.dart:29` |
| `LocationScreen` | `ui/viewer/location/location_screen.dart:32` | Gallery for one location tag | `ui/viewer/file_details/location_tags_widget.dart:136`; `services/search_service.dart:1147`, `:1678` |

## 1.6 Memories / rituals / wrapped

| Screen | File path | Purpose | How you reach it |
|---|---|---|---|
| `FullScreenMemory` (+`FullScreenMemoryDataUpdater`) | `ui/home/memories/full_screen_memory.dart:71` (1668 lines) | Story-style memory player | `ui/home/memories/all_memories_page.dart:141`; `services/memories_cache_service.dart:1375` |
| `AllMemoriesPage` | `ui/home/memories/all_memories_page.dart:63`, opener `:21` | Pager over every memory | Memories strip `ui/home/memories/memories_strip.dart:258`; `services/memories_cache_service.dart:1291` |
| `MemoryLanePage` | `ui/viewer/people/memory_lane_page.dart:31` (1660 lines) | "Memory lane" faces timeline (v1) | `ui/viewer/people/memory_lane_page_v2.dart:48` |
| `MemoryLanePageV2` | `ui/viewer/people/memory_lane_page_v2.dart:66` | Faces timeline (v2), internal-user gated | `ui/viewer/people/memory_lane_page_v2.dart:42`; `ui/home/memories/all_memories_page.dart:170`; `ui/viewer/people/cluster_page.dart:186` |
| `RitualPage` | `ui/rituals/ritual_page.dart:33` (1584 lines) | One ritual: streak heatmap, photos | `ui/rituals/all_rituals_screen.dart:145`; `ui/rituals/rituals_banner.dart:125`, `:243`; `ui/tabs/home_widget.dart:1290` |
| `AllRitualsScreen` | `ui/rituals/all_rituals_screen.dart:21` | List of rituals | `ui/rituals/rituals_banner.dart:52`, `:101`; `ui/rituals/ritual_camera_page.dart:498`, `:1224` |
| `RitualCameraPage` | `ui/rituals/ritual_camera_page.dart:52` (1583 lines) | In-app camera for a ritual | `ui/rituals/ritual_camera_page.dart:32`; `ui/tabs/home_widget.dart:1296` |
| `WrappedViewerPage` | `ui/wrapped/wrapped_viewer_page.dart:70` (1589 lines) | Year-in-review story cards | `ui/wrapped/wrapped_rewind_banner_button.dart:177` |

## 1.7 People / faces

| Screen | File path | Purpose | How you reach it |
|---|---|---|---|
| `PeoplePage` | `ui/viewer/people/people_page.dart:37` | One named person's gallery | People section `ui/viewer/search_tab/people_section.dart:305`, `:316`; file info `ui/viewer/file_details/file_info_faces_item_widget.dart:799`, `file_info_face_widget.dart:215`; `ui/viewer/gallery/hierarchical_search_gallery.dart:147` |
| `ClusterPage` | `ui/viewer/people/cluster_page.dart:38` | One unnamed face cluster | `ui/viewer/file_details/file_info_face_widget.dart:263`, `:283`; `ui/viewer/people/cluster_app_bar.dart:323`; `ui/viewer/people/person_cluster_suggestion.dart:160` |
| `PeopleSectionAllPage` | `ui/viewer/search/result/people_section_all_page.dart:38` (1144 lines) | All people, with in-page search | `ui/viewer/search_tab/people_section.dart:97`; `ui/viewer/search_tab/section_header.dart:85` |
| `SaveOrEditPerson` | `ui/viewer/people/save_or_edit_person.dart:33` (1140 lines) | Name / edit a person, pick avatar, merge | `ui/viewer/actions/people_selection_action_widget.dart:330`; `ui/viewer/file_details/file_info_face_widget.dart:305`; `ui/viewer/people/merge_clusters_to_person_sheet.dart:181` |
| `PersonReviewClusterSuggestion` | `ui/viewer/people/person_cluster_suggestion.dart:33` | Accept/reject "is this the same person?" suggestions | `ui/viewer/actions/people_selection_action_widget.dart:345`; `ui/viewer/people/people_app_bar.dart:449` |
| `PersonClustersPage` | `ui/viewer/people/person_clusters_page.dart:20` | All face clusters belonging to a person | `ui/viewer/people/person_cluster_suggestion.dart:85` |
| `ClusterBreakupPage` | `ui/viewer/people/cluster_breakup_page.dart:9` | Result of splitting a mixed cluster | `ui/viewer/people/cluster_app_bar.dart:359` |
| `MergeClustersToPersonPage` | `ui/viewer/people/merge_clusters_to_person_sheet.dart:71`, opener `:44` | Pick an existing person to merge into | `ui/viewer/actions/people_selection_action_widget.dart:622`; `ui/viewer/people/save_or_edit_person.dart:369` |
| `AddFilesToPersonPage` | `ui/viewer/people/add_files_to_person_page.dart:27` | Manually tag selected files to a person | `ui/viewer/actions/file_selection_actions_widget.dart:832`; `ui/viewer/file_details/file_info_faces_item_widget.dart:763` |
| `ReassignMeSelectionPage` | `ui/viewer/people/reassign_me_selection_page.dart:19` | Change which person is "Me" | `ui/viewer/people/people_app_bar.dart:663` |
| `SmartAlbumPeople` | `ui/collections/album/smart_album_people.dart:23` | Choose people to auto-add to an album | `ui/viewer/gallery/gallery_app_bar_widget.dart:643`; `ui/viewer/gallery/empty_album_state.dart:63` |

## 1.8 Search results

| Screen | File path | Purpose | How you reach it |
|---|---|---|---|
| `SearchResultPage` | `ui/viewer/search/result/search_result_page.dart:22` | Gallery for one search result (location, file type, person, …) | `ui/viewer/search/result/searchable_item.dart:57`; `ui/viewer/search_tab/people_section.dart:207`, `locations_section.dart:160`, `file_type_section.dart:181` |
| `SearchSectionAllPage` | `ui/viewer/search/result/search_section_all_page.dart:27` | "See all" for one search-tab section | `ui/viewer/search_tab/section_header.dart:87` |
| `MagicResultScreen` | `ui/viewer/search/result/magic_result_screen.dart:26` | Gallery for a magic/CLIP category | `ui/viewer/search/result/search_section_all_page.dart:241`; `services/search_service.dart:1818`; `services/magic_cache_service.dart:199` |
| `ContactResultPage` | `ui/viewer/search/result/contact_result_page.dart:45` | One contact: their shared photos + details | `ui/viewer/search_tab/contacts_section.dart:222`; `ui/viewer/search/result/searchable_item.dart:52`; `search_result_widget.dart:50` |
| `EditContactPage` | `ui/viewer/search/result/edit_contact_page.dart:36` | Edit a contact's name/photo/linked person | `ui/viewer/search/result/contact_result_page.dart:303`; `ui/family/family_plan_page.dart:692`; `ui/social/social_actor_contact_navigation.dart:104` |
| `ContactPersonPickerPage` | `ui/viewer/search/result/contact_person_picker_page.dart:83` | Pick a person to autofill a contact | `ui/viewer/search/result/edit_contact_page.dart:362` |
| `ContactPhotoAdjustPage` | `ui/viewer/search/result/contact_photo_adjust_page.dart:7` | Crop/position a contact photo | `ui/viewer/search/result/edit_contact_page.dart:508` |

## 1.9 Sharing / collaboration

| Screen | File path | Purpose | How you reach it |
|---|---|---|---|
| `ShareCollectionPage` | `ui/sharing/share_collection_page.dart:21` | Share an album: people, roles, public link | Album app bar `ui/viewer/gallery/gallery_app_bar_widget.dart:1286`; `ui/collections/album/vertical_list.dart:487` |
| `AlbumParticipantsPage` | `ui/sharing/album_participants_page.dart:21` | Manage who is on a shared album | `ui/viewer/gallery/gallery_app_bar_widget.dart:1290` |
| `ManageLinksWidget` | `ui/sharing/manage_links_widget.dart` | Public-link settings (expiry, device limit, password, downloads, collect) | From `ShareCollectionPage` |
| `LayoutPickerPage` | `ui/sharing/pickers/layout_picker_page.dart:14` | Pick the public-link album layout | `ui/sharing/manage_links_widget.dart:82` |
| `LibrarySharingPage` | `ui/sharing/library_sharing/library_sharing_page.dart:17` | Share the whole library with someone | `ui/family/family_plan_page.dart:759` |
| `AllLinksPage` | `ui/tabs/shared/all_links_page.dart:27` | Every active public / quick link | `ui/tabs/albums/albums_manage_sheet.dart:44` |
| `FeedScreen` (pushed instance) | `ui/social/feed_screen.dart:83` | Feed opened on a specific target from a notification | `ui/tabs/home_widget.dart:1307` |

## 1.10 Storage, plans, growth

| Screen | File path | Purpose | How you reach it |
|---|---|---|---|
| `StripeSubscriptionPage` | `ui/payment/stripe_subscription_page.dart:31` | Stripe plan picker | `ui/payment/subscription.dart:9`, `:12` |
| `StoreSubscriptionPage` | `ui/payment/store_subscription_page.dart:37` | Play Store / App Store plan picker | `ui/payment/subscription.dart:14` |
| `PaymentWebPage` | `ui/payment/payment_web_page.dart:18` | Stripe checkout webview | `ui/payment/stripe_subscription_page.dart:555`, `:706` |
| `AddOnPage` | `ui/payment/add_on_page.dart:10` | Storage add-on details | `ui/payment/view_add_on_widget.dart:32` |
| `FamilyPlanPage` | `ui/family/family_plan_page.dart:39` (1017 lines) | Family plan dashboard | `ui/payment/store_subscription_page.dart:274`; `stripe_subscription_page.dart:70`; `services/account/billing_service.dart:130` |
| `InviteMembersPage` | `ui/family/invite_members_page.dart:27` | Invite family members | `ui/family/family_plan_page.dart:492` |
| `EditStorageLimitPage` | `ui/family/edit_storage_limit_page.dart:14` | Cap a family member's storage | `ui/family/family_plan_page.dart:627` |
| `_ReferralScreen` | `ui/growth/referral_screen.dart:56`, opener `:18` | Referral code + stats | `ui/settings_page.dart:364`; `ui/tabs/home_widget.dart:1254` |
| `StorageDetailsScreen` | `ui/growth/storage_details_screen.dart:12` | Referral storage breakdown | `ui/growth/referral_screen.dart:229`; `ui/growth/code_success_screen.dart:56` |
| `CodeSuccessScreen` | `ui/growth/code_success_screen.dart:12` | Referral code applied confirmation | `ui/growth/apply_code_sheet.dart:94` |

## 1.11 Tools

| Screen | File path | Purpose | How you reach it |
|---|---|---|---|
| `ImageEditorPage` | `ui/tools/editor/image_editor/image_editor_page.dart:43` | Crop/rotate, filters, tune, paint, text | `ui/viewer/file/detail_page.dart:849` (viewer overflow → Edit) |
| `VideoEditorPage` | `ui/tools/editor/video_editor_page.dart:39` | Video editor host | `ui/viewer/file/detail_page.dart:828` |
| `VideoTrimPage` | `ui/tools/editor/video_trim_page.dart:6` | Trim sub-page | `ui/tools/editor/video_editor_page.dart:204` |
| `VideoCropPage` | `ui/tools/editor/video_crop_page.dart:8` | Crop sub-page | `ui/tools/editor/video_editor_page.dart:213` |
| `VideoRotatePage` | `ui/tools/editor/video_rotate_page.dart:8` | Rotate sub-page | `ui/tools/editor/video_editor_page.dart:222` |
| `CollageCreatorPage` | `ui/tools/collage/collage_creator_page.dart:22` | Build a 2–6 photo collage | `ui/viewer/actions/file_selection_actions_widget.dart:959` |
| `DeduplicatePage` | `ui/tools/deduplicate_page.dart:24` | Exact-duplicate cleanup | `ui/settings/backup/free_space_options.dart:192` |
| `SimilarImagesPage` | `ui/tools/similar_images_page.dart:40` (1343 lines) | ML near-duplicate cleanup | `ui/settings/backup/free_space_options.dart:96` |
| `FreeSpacePage` | `ui/tools/free_space_page.dart:18` | Delete backed-up local copies | `ui/settings/backup/free_space_options.dart:162`; `ui/viewer/gallery/gallery_app_bar_widget.dart:471` |
| `AppStorageViewer` | `ui/tools/debug/app_storage_viewer.dart:16` | Per-directory cache sizes | `ui/settings/backup/free_space_options.dart:79` |
| `WebPage` | `ui/common/web_page.dart:7` | Generic in-app webview (FAQ, ToS, help) | `ui/account/email_entry_page.dart:435`, `:452`; `ui/account/password_entry_page.dart:291`; `ui/growth/referral_screen.dart:240`; `ui/viewer/gallery/gallery_app_bar_widget.dart:1322` |
| `ChangeLogPage` | `ui/notification/update/change_log_page.dart:12` | "What's new" after an update | `ui/tabs/home_widget.dart:1246`; `ui/settings/debug/debug_settings_page.dart:202` |

## 1.12 Legacy (trusted contacts) — lives outside `ui/`

| Screen | File path | Purpose | How you reach it |
|---|---|---|---|
| `EmergencyPage` | `emergency/emergency_page.dart:25` | Legacy / trusted-contacts dashboard | `ui/settings_page.dart:325` (auth-gated) |
| `OtherContactPage` | `emergency/other_contact_page.dart:17` | Accounts you are a trusted contact for | `emergency/emergency_page.dart:287` |
| `RecoverOthersAccount` | `emergency/recover_others_account.dart` | Start / manage recovery of someone else's account | From `OtherContactPage` |
| `AddContactSheet` | `emergency/select_contact_page.dart` | Pick a trusted contact | From `EmergencyPage` |

Settings screens are listed separately in §5.

---

# 2. NAVIGATION MAP

## 2.1 How navigation is implemented

- There is **no named-route table**. Everything is an imperative push through
  `routeToPage(...)` (`{PKG}/ente_pure_utils/lib/src/navigation_util.dart:6`)
  or a raw `Navigator.push(MaterialPageRoute(...))`.
- The only global navigator handle is
  `AppNavigationService.instance.navigatorKey` (`{APP}/app.dart:224`), used for
  intent-driven pushes (`app.dart:182`, `:193`).
- Tab switching is event-driven, not `Navigator`-driven: `TabChangedEvent` on
  the global bus (`{APP}/ui/home/home_bottom_nav_bar.dart:95`, consumed at
  `{APP}/ui/tabs/home_widget.dart:194-196`).
- Settings is a **drawer**, not a pushed route (`{APP}/ui/tabs/home_widget.dart:891-900`).

## 2.2 Depth convention

Depth 0 = the tab surface itself. Each `routeToPage` / sheet adds 1. Opening
the drawer counts as 1. Depths below are the **shortest** path from a cold
launch into a signed-in Home tab; several screens have additional deeper
routes listed in §1.

## 2.3 Tree

```
App launch  (app.dart:214)
│
├─ IntentAction.pick ────────► ExternalMediaPickerPage                    [d0, replaces shell]
├─ IntentAction.view (img/vid) ► FileViewer                               [d0, replaces shell]
└─ default ─────────────────► HomeWidget  (Scaffold + drawer + 4 tabs)    [d0]
   │
   ├─ no account, not local-gallery ► LandingPageWidget                   [d0]
   │     ├─ Sign up ───► EmailEntryPage ─► OTTVerificationPage ─► PasswordEntryPage(set)
   │     │                                    └─► RecoveryKeyPage         [d1..d4]
   │     ├─ Log in ────► LoginPage ─► LoginPasswordVerificationPage       [d1..d2]
   │     │                 ├─► TwoFactorAuthenticationPage | PasskeyPage  [d3]
   │     │                 │      └─► TwoFactorRecoveryPage               [d4]
   │     │                 └─► RecoveryPage ─► PasswordEntryPage(reset)   [d3..d4]
   │     └─ Continue without account ► GrantPermissionsWidget             [d0]
   │
   ├─ permission missing ► GrantPermissionsWidget                         [d0]
   ├─ first sync ───────► LoadingPhotosWidget ─► BackupFolderSelectionPage[d0..d1]
   │
   ├─ DRAWER (hamburger, home_header_widget.dart:30; or over-scroll left
   │          on the pager, extents_page_view.dart:99-105)
   │  └─ SettingsPage                                                     [d1]
   │     └─ (full tree in §5)                                             [d2+]
   │
   ├─ TAB 0 · HOME  (home_widget.dart:1072 → HomeGalleryWidget)           [d0]
   │  ├─ HeaderWidget (header_widget.dart:59-75)
   │  │  ├─ StatusBarWidget ─► BackupSettingsScreen | BackupStatusScreen  [d1]
   │  │  │   ├─ sync-error banner ─► subscription page / free-up-space    [d1]
   │  │  │   ├─ ML banner ────────► MachineLearningSettingsPage           [d1]
   │  │  │   ├─ large-backup banner ► LargeBackupScreen                   [d1]
   │  │  │   └─ recovery banner ──► VerifyRecoveryPage                    [d1]
   │  │  ├─ GetStartedBanner ────► EmailEntryPage                         [d1]
   │  │  ├─ MemoriesStripWidget ─► AllMemoriesPage ─► FullScreenMemory    [d1..d2]
   │  │  └─ RewindBanner ────────► WrappedViewerPage                      [d1]
   │  ├─ tap tile ──────────────► DetailPage                              [d1]
   │  │   ├─ overflow → Edit ───► ImageEditorPage | VideoEditorPage       [d2]
   │  │   │                          └─ Trim | Crop | Rotate sub-pages    [d3]
   │  │   ├─ overflow → Info ───► FileDetailsWidget (sheet)               [d2]
   │  │   │     ├─ date row ────► JumpToDateGallery                       [d3]
   │  │   │     ├─ faces row ───► PeoplePage | ClusterPage | SaveOrEditPerson [d3]
   │  │   │     ├─ location row ► LocationScreen | MapScreen              [d3]
   │  │   │     └─ albums row ──► CollectionPage                          [d3]
   │  │   └─ panorama file ─────► PanoramaViewerScreen                    [d2]
   │  ├─ long-press tile ───────► selection mode → FileSelectionOverlayBar[d0]
   │  └─ group header ⋮ ────────► GalleryLayoutSettings (sheet)           [d1]
   │        └─ Custom ──────────► GallerySettingsScreen                   [d2]
   │
   ├─ TAB 1 · ALBUMS  (albums_tab.dart:48)                                [d0]
   │  ├─ filter chips: Ente / On device / Shared / Received (:949-1010)
   │  ├─ search icon (:915) → in-place search field (:887)
   │  ├─ ⋮ menu: toggle grid/list, sort by name, sort by last-updated (:44)
   │  ├─ tap album ─────────────► CollectionPage                          [d1]
   │  │   ├─ app-bar share ────► ShareCollectionPage                      [d2]
   │  │   │    ├─ ManageLinksWidget ─► LayoutPickerPage                   [d3..d4]
   │  │   │    └─ AlbumParticipantsPage                                   [d3]
   │  │   └─ overflow (26 entries, §3c)                                   [d2+]
   │  ├─ tap device folder ────► DeviceFolderPage ─► SkippedDeviceFolderPage [d1..d2]
   │  ├─ long-press album ─────► album selection mode                     [d0]
   │  └─ "More" sheet (albums_manage_sheet.dart:26)                       [d1]
   │     ├─ Links ─────────────► AllLinksPage                             [d2]
   │     ├─ Uncategorized ─────► UnCategorizedPage                        [d2]
   │     ├─ Archive ───────────► ArchivePage ─► CollectionListPage        [d2..d3]
   │     ├─ Hidden (auth) ─────► HiddenPage ─► CollectionListPage         [d2..d3]
   │     └─ Trash ─────────────► _TrashPage                               [d2]
   │
   ├─ TAB 2 · FEED  (feed_screen.dart:83)                                 [d0]
   │  ├─ feed item ────────────► DetailPage (:347, :371, :787, :837, :874)[d1]
   │  ├─ album chip ───────────► CollectionPage (:722)                    [d1]
   │  └─ comments ─────────────► FileCommentsBottomSheet                  [d1]
   │        └─ likes ──────────► showCommentLikesBottomSheet              [d2]
   │
   └─ TAB 3 · SEARCH  (search_tab.dart:32)                                [d0]
      ├─ search field (search_widget.dart:180) → SearchSuggestionsWidget  [d0]
      │     └─ suggestion ─────► SearchResultPage | CollectionPage |
      │                          DeviceFolderPage | LocationScreen        [d1]
      ├─ People section ──────► PeoplePage                                [d1]
      │     └─ "see all" ─────► PeopleSectionAllPage                      [d1]
      ├─ Magic section ───────► MagicResultScreen                         [d1]
      ├─ Locations section ───► SearchResultPage / LocationScreen         [d1]
      ├─ Contacts section ────► ContactResultPage ─► EditContactPage      [d1..d2]
      ├─ File types section ──► SearchResultPage                          [d1]
      ├─ Rituals section ─────► AllRitualsScreen ─► RitualPage            [d1..d2]
      │                                              └─► RitualCameraPage [d3]
      └─ Wrapped section ─────► WrappedViewerPage                         [d1]
```

## 2.4 Back-button semantics (`{APP}/ui/tabs/home_widget.dart:836-884`)

| Context | Back does |
|---|---|
| Tab 0 with a selection | Clear the file selection (`:851-853`) |
| Tab 0, drawer open | Close the drawer (`:855`) |
| Tab 0, Android, `IntentAction.main` | `MoveToBackground.moveTaskToBack()` (`:857`) |
| Tab 1 with album selection | Clear album selection (`:865-867`) |
| Tab 1 with search active | Deactivate search (`:869-874`) |
| Tab 3 with active query | Fire `ClearAndUnfocusSearchBar` (`:878-880`) |
| Any other tab | Fire `TabChangedEvent(0, backButton)` — jump to Home (`:883`) |

The `Scaffold` is `PopScope(canPop: false)` (`:836-837`), so all back handling is
manual.

## 2.5 Drawer open gestures

1. Hamburger button in the home header — `{APP}/ui/components/home_header_widget.dart:30`.
2. Over-scrolling the tab pager past the left edge by 45 px —
   `{APP}/ui/extents_page_view.dart:99-105`.
   Flutter's own edge-drag is explicitly disabled
   (`drawerEnableOpenDragGesture: false`, `{APP}/ui/tabs/home_widget.dart:890`).

---

# 3. ACTION INVENTORY

Surface codes: **AB** = app bar icon · **OF** = overflow (`EntePopupMenuButton`)
· **BB** = bottom bar icon · **SB** = bottom sheet · **LP** = long-press ·
**OV** = in-content overlay · **RO** = row in the Info sheet.

## 3a. Single photo / video (in `DetailPage`)

### App bar (`{APP}/ui/viewer/file/file_app_bar.dart:240-527`)

| Action | Surface | Line | Condition |
|---|---|---|---|
| Back | AB | `:209` | always |
| Unsupported-format tooltip | AB | `:250-276` | thumbnail fallback active |
| Live-photo hint ("press and hold") | AB | `:293-307` | `file.isLiveOrMotionPhoto` |
| Favorite / unfavorite | AB | `:313-318` | uploaded, not hidden/trash, not public-link gallery |
| Upload (tap to upload) | AB | `:320-324` | not uploaded, not trash, not local-gallery mode |
| Download | OF (`value 1`) | `:342-347` | uploaded |
| Send link | OF (`14`) | `:349-356` | owned, not hidden |
| Edit | OF (`11`) | `:362-370` | image / live photo / video, edit allowed |
| Archive / Unarchive | OF (`2`) | `:372-385` | owned, uploaded, not hidden |
| Set as (wallpaper) | OF (`3`) | `:387-395` | image or live photo, **Android only** |
| Hide | OF (`4`) | `:397-404` | owned, uploaded, not hidden |
| Unhide | OF (`5`) | `:405-412` | owned, uploaded, hidden |
| Guest view | OF (`6`) | `:415-421` | always (needs device lock) |
| Suggest deletion | OF (`13`) | `:424-431` | `canSuggestDeleteForFile` |
| Info | OF (`12`) | `:433-439` / `:331-338` | always (only entry in restricted mode) |
| Play original / Play stream | OF (`15`) | `:443-452` | video with a stream-change state |
| Playback speed | OF (`10`) | `:455-465` | video |
| Create stream | OF (`8`) | `:468-476` | video, `_shouldShowCreateStreamOption()` |
| Recreate stream | OF (`9`) | `:478-486` | video, `_shouldShowRecreateStreamOption()` |
| Loop video on / off | OF (`7`) | `:488-497` | video |

Dispatch table: `{APP}/ui/viewer/file/file_app_bar.dart:546-599` (invoked at `:509`).
In `DetailPageMode.minimalistic` or on a trashed file, the overflow collapses to
**Info only** (`:326-338`).

### Bottom bar (`{APP}/ui/viewer/file/file_bottom_bar.dart:98-220`)

| Action | Surface | Line | Condition |
|---|---|---|---|
| Restore | BB | `:236-270` | trashed |
| Delete (permanent) | BB | `:276-300` | trashed |
| Delete (→ `showSingleFileDeleteSheet`) | BB | `:122-148` | owned, not trash |
| Suggest deletion | BB | `:149-150`, `:310-320` | internal user + shared collection + eligible |
| Share (OS share sheet) | BB | `:152-172` | not trash |
| Add to album (→ `showCollectionActionSheet`) | BB | `:174-198` | uploaded, not hidden |

### Social overlay on the photo (`{APP}/ui/social/widgets/file_social_overlay.dart`)

| Action | Surface | Line |
|---|---|---|
| Like / unlike | OV | `:489-510` (`_toggleReaction`) |
| See who liked | OV + LP | `:490` → `_showLikes` (`:374`) |
| Open comments | OV | `:512-521` → `_openComments` (`:419`) |
| Latest-comment pill → comments | OV | `:461-462` |
| Pick which album to like into | SB | `:286` `showLikeCollectionSelectorSheet` |

Mounted at `{APP}/ui/viewer/file/detail_page.dart:1112` and
`{APP}/ui/home/memories/full_screen_memory.dart:891`.

### Info sheet rows (`showDetailsSheet` → `{APP}/ui/viewer/file/file_details_widget.dart:154-265`)

| Row | Line | Action it exposes |
|---|---|---|
| Caption / description editor | `:167` | edit caption |
| Creation time | `:177` | edit date; tap → `JumpToDateGallery` (`creation_time_item_widget.dart:37`) |
| File properties (name, size, …) | `:180` | rename |
| Basic EXIF | `:190` | — |
| Faces | `:200` | open person/cluster, tag to person, remove tag |
| Pets | `:205` | gated by `flagService.petEnabled` + `localSettings.petRecognitionEnabled` |
| Location tags | `:218` | add/edit location, open map |
| Albums containing this file | `:229` | jump to `CollectionPage` |
| Preview (stream) properties | `:239`, `:257` | — |
| All EXIF | `:248` | full EXIF dialog |
| Added by | `:319` | — |

## 3b. Multi-select (files)

Container: `{APP}/ui/viewer/actions/file_selection_actions_widget.dart`
(1386 lines) rendered inside `FileSelectionOverlayBar` →
`BottomActionBarWidget`. Every entry is a `SelectionActionButton`
(`{APP}/ui/components/bottom_action_bar/selection_action_button_widget.dart`,
67 call sites). The bar replaces the bottom nav, which animates to zero height
(`{APP}/ui/home/home_bottom_nav_bar.dart:124-128`).

| Action | Line | Shown when |
|---|---|---|
| Restore | `:177-182` | trash |
| Permanently delete | `:184-190` | trash |
| Delete from device | `:193-199` | local-only files |
| Delete | `:202-207`, `:351-357` | owned files present |
| Reject suggestions | `:210-217` | delete-suggestions gallery |
| Share | `:221-231` | — |
| Offline link | `:234-240` | `flagService.offlineLinkSharing` (internal), `pendingTranslation("(i) Offline link")` |
| Copy link | `:245-250` | uploaded files |
| Send link | `:253-258` | owned files |
| Add to Ente | `:270-275` | local files not yet uploaded |
| Add to album | `:278-283` | — |
| Add to hidden album | `:289-295` | hidden context |
| Move to album | `:299-305` | owned + uploaded |
| Move to hidden album | `:310-316` | hidden context |
| Remove from album | `:320-327`, `:331-337` | in an album, removable files |
| Suggest deletion | `:341-347` | eligible shared collection |
| Download | `:384-390` | — |
| Favorite | `:394-400` | owned + uploaded |
| Remove from favorites | `:403-409` | favorites gallery |
| Add to person | `:415-421` | `flagService.manualTagFileToPerson` + uploaded IDs |
| Not `{name}`? | `:426-433` | person gallery |
| Use as cover | `:436-443` | person gallery |
| Not this person? | `:447-453` | cluster gallery |
| Create collage | `:457-463` | 2–6 files selected |
| Hide | `:468-474` | owned + uploaded |
| Unhide | `:477-483` | hidden gallery |
| Archive | `:488-494` | owned + uploaded |
| Unarchive | `:497-503` | archive gallery |
| Edit time | `:529-546` | all selected support it |
| Edit location | `:550-559` | any selected supports it |
| Guest view | `:562-568` | — |

Select-all / deselect-all lives in the bar header
(`{APP}/ui/viewer/actions/select_all_status_icon.dart`), and per-day/section
select-all is the checkbox in the group header
(`{APP}/ui/viewer/gallery/component/group/group_header_widget.dart:119-137`).

## 3c. Album

### Album app bar (`{APP}/ui/viewer/gallery/gallery_app_bar_widget.dart`)

| Action | Surface | Line |
|---|---|---|
| Add files | AB | `:557-568` |
| Share (or link icon when a quick link exists) | AB | `:571-587` |
| Overflow (⋮) | AB | `:597-604` |
| Rename album (quick link only, `_renameAlbum`) | AB | `:370-380` |

### Album overflow menu — `enum AlbumPopupAction` has 29 members (`:164-190`); menu built at `:740-975`, dispatched at `:606-880`

| Action | Line in menu builder | Gate |
|---|---|---|
| Edit details | `:752-759` | `galleryType.canEditDetails()` |
| Convert to album | `:760-768` | quick link |
| Map | `:769-777` | `galleryType.showMap()` |
| Sort by | `:778-786` | `galleryType.canSort()` |
| Clean Uncategorized | `:787-795` | uncategorized |
| Pin / Unpin | `:796-807` | `galleryType.canPin()` |
| Edit location | `:808-816` | location tag |
| Delete location | `:817-830` | location tag |
| Archive / Unarchive album | `:831-843` | owned, archivable |
| Hide / Unhide | `:844-855` | `galleryType.canHide()` |
| Guest view | `:856-864` | collection present |
| Cast album | `:865-877` | `castService.isSupported` |
| Slideshow | `:878` (`_slideshowMenuOption`, `:983`) | collection or device collection |
| Auto-add people / Edit auto-add people | `:879-887` | ML consent + `collection.canAutoAdd` |
| Delete album / Remove link | `:888-899` | `galleryType.canDelete()` |
| Pin (sharee) / Unpin | `:900-911` | shared collection |
| Archive (sharee) | `:912-924` | shared collection |
| Hide (sharee) | `:925-936` | shared collection |
| Leave album | `:937-945` | shared collection |
| Free up space | `:946-954` | local folder, not iCloud shared |
| Disable backup | `:955-963` | device folder currently backed up |
| Download album | `:964-974` | public collection with downloads enabled |

Sort submenu: Newest first / Oldest first (`:1196-1202`), plus Most recent /
Most relevant for people-driven galleries (`:533-537`).

### Album multi-select (`{APP}/ui/viewer/actions/album_selection_action_widget.dart`)

Entered by long-pressing an album row/tile
(`{APP}/ui/collections/album/row_item.dart:356-359`,
`list_item.dart:76-78`).

| Action | Line |
|---|---|
| Share | `:95-101` |
| Slideshow | `:106-110` |
| Pin / Unpin | `:115-129` |
| Delete | `:133-137`, `:168-174`, `:185-190` |
| Hide / Unhide | `:141-156`, `:178-183`, `:231-236` |
| Archive / Unarchive | `:161-166`, `:194-198` |
| Pin / Unpin (sharee) | `:212-226` — gated by `flagService.enableShareePin` (`:203`) |
| Leave album | `:239-244` |

### Albums-tab "More" sheet (`{APP}/ui/tabs/albums/albums_manage_sheet.dart:26-126`)

Links (`:31`), Uncategorized (`:55`), Archive (`:77`), Hidden (`:87`, auth-gated
at `:94`), Trash (`:105`).

### Other album-scoped actions

| Action | File:line |
|---|---|
| Add photos to album (sheet) | `{APP}/ui/viewer/gallery/hooks/add_photos_sheet.dart:26` |
| Edit album details (name, description, cover) | `{APP}/ui/viewer/gallery/hooks/edit_album_details_sheet.dart:34` |
| Pick cover photo | `{APP}/ui/viewer/gallery/hooks/pick_cover_photo.dart:15` |
| Delete empty albums | `{APP}/ui/viewer/actions/delete_empty_albums.dart:11` |
| Create album from selection | `{APP}/ui/collections/collection_action_sheet.dart:78` |

## 3d. Person / face

### Person app bar — `enum PeoplePopupAction` (`{APP}/ui/viewer/people/people_app_bar.dart:101`)

| Action | Surface | Line |
|---|---|---|
| Share person's photos | AB | `:296-301` |
| Memory lane | OF | `:318-320` |
| Edit (rename) | OF | `:331-333`, `:412-414` |
| Review suggestions | OF | `:340-342`, `:421-423` |
| Set cover | OF | `:349-351` |
| Pin / Unpin person | OF | `:357-361` |
| Hide from memories / Show in memories | OF | `:369-373` |
| Reassign "Me" | OF | `:385-387` |
| Ignore person | OF | `:393-395` |
| Remove label | OF | `:401-403` |
| Show person (un-ignore) | OF | `:429-431` |

Dispatch at `:445-474`. Confirmation copy: reset (`:531-533`), ignore
(`:556-558`), un-ignore (`:594-595`).

### Cluster app bar — `enum ClusterPopupAction` (`{APP}/ui/viewer/people/cluster_app_bar.dart:82`)

| Action | Surface | Line |
|---|---|---|
| Share | AB | `:161-166` |
| Memory lane | OF | `:180-182` |
| Ignore person | OF | `:189-191` |
| Mixed grouping? (split cluster) | OF | `:197-199` |
| Break up cluster (debug) | OF | `:206` — internal only |

### People multi-select (`{APP}/ui/viewer/actions/people_selection_action_widget.dart`)

| Action | Line |
|---|---|
| Edit | `:192-197` |
| Review | `:200-205` |
| Ignore | `:208-213` |
| Merge | `:216-221` |
| Reset | `:224-229` |
| Show person | `:232-237` |
| Pin / Unpin | `:240-253` |
| Hide from memories / Show in memories | `:256-269` |
| Auto-add to album | `:272-282` |

### Face-level actions inside the Info sheet

| Action | File:line |
|---|---|
| Open person or cluster from a face chip | `{APP}/ui/viewer/file_details/file_info_face_widget.dart:207-283` |
| Name / edit the person behind a face | `{APP}/ui/viewer/file_details/file_info_face_widget.dart:305` |
| Add these files to a person | `{APP}/ui/viewer/file_details/file_info_faces_item_widget.dart:750-770` |
| Show more / fewer faces | strings `showMoreFaces` / `showLessFaces` |
| Remove person tag | strings `removePersonTag`, `removePersonLabel` |

---

# 4. GESTURE INVENTORY

## 4.0 Direct answers to the two explicit questions

| Question | Answer | Evidence |
|---|---|---|
| **Pinch-to-change-grid-density in the gallery grid?** | **No.** No `onScaleStart` / `onScaleUpdate` / `ScaleGestureRecognizer` exists anywhere under `{APP}/ui/viewer/gallery/`. Grid density is a persisted setting only (`localSettings.getPhotoGridSize()`), changed via the layout sheet or Gallery settings. | Grid size read at `{APP}/ui/viewer/gallery/gallery.dart:488`, `:841`; only writer is `{APP}/ui/viewer/gallery/layout_settings.dart:132` and the Gallery settings screen `{APP}/ui/settings/gallery_settings_screen.dart:74`. The only `onScaleStart`/`onScaleUpdate` in the whole app are the ritual camera (`{APP}/ui/rituals/ritual_camera_page.dart:827-828`) and wallpaper crop (`{APP}/ui/wallpaper/wallpaper_crop.dart:76-79`). |
| **Drag-to-multi-select in the gallery grid?** | **Yes**, fully implemented, with edge auto-scroll and haptics. | `{APP}/ui/viewer/gallery/swipe_selection_wrapper.dart`, `swipe_to_select_helper.dart`, `component/swipe_selectable_file_widget.dart`, `state/gallery_swipe_helper.dart`. |

## 4.1 Gallery grid

| Gesture | Handler | File:line | Behaviour |
|---|---|---|---|
| Tap tile | `GestureDetector.onTap` | `{APP}/ui/viewer/gallery/component/gallery_file_widget.dart:142-148` | No selection → push `DetailPage` (`:302-322`); selection active → toggle that file; picker intent → return URI (`:255-262`) |
| Long-press tile | `GestureDetector.onLongPress` | `gallery_file_widget.dart:149-153` | No selection → select this file and arm swipe-select (`:265-284`); selection already active → open `DetailPage` instead (`:267`) |
| Long-press then drag | `SwipeToSelectHelper.startSelection(forceSelecting: true)` | `gallery_file_widget.dart:274-284` | Range-selects across the drag; `HapticFeedback.selectionClick()` per step (`swipe_to_select_helper.dart:33`, `:36`) |
| Drag over tiles (selection already active) | `Listener.onPointerMove` | `swipe_selection_wrapper.dart:99-134` | Swipe mode arms only on **horizontal-dominant** initial movement for an existing selection (`:114-129`); any direction (>4 px) when the selection was just created by long-press (`:103-113`) |
| Pointer enters/leaves a tile during a drag | `Listener.onPointerDown` / `onPointerMove` / `onPointerUp` | `component/swipe_selectable_file_widget.dart:59-90` | Feeds `onPointerStateChanged` back to the tile |
| Drag near top/bottom edge | Ticker-driven auto-scroll | `swipe_selection_wrapper.dart:154+`, constants `:52-59` | Speed curve `_speedExponent = 1.20`, capped at `_baselineMaxScrollSpeed = 12 px/frame @120 Hz` |
| Release drag | `onPointerUp` / `onPointerCancel` | `swipe_selection_wrapper.dart:135-148` | Ends selection session |
| Tap group-header checkbox | `GestureDetector.onTap` | `component/group/group_header_widget.dart:119-137` | `toggleGroupSelection` for the whole day/week/month + haptic (`:131`) |
| Tap group-header ⋮ | `GestureDetector.onTap` | `component/group/group_header_widget.dart:142-144` | Opens the layout settings sheet |
| Vertical scroll | `CustomScrollBar` + `ScrollController` | `{APP}/ui/viewer/gallery/scrollbar/custom_scroll_bar.dart` | Custom draggable scrollbar with date divisions |
| Pull-down (Christmas period only) | `NotificationListener<ScrollNotification>` | `{APP}/ui/tabs/home_widget.dart:1112-1147` | Over-scroll up to 200 px drives a snow overlay |
| Horizontal swipe between tabs | `ExtentsPageView` | `{APP}/ui/tabs/home_widget.dart:1060-1108` | Locked (`NeverScrollableScrollPhysics`) while a swipe-select or album selection is in progress (`:1053-1058`) |
| Over-scroll left past 45 px | `PageController` listener | `{APP}/ui/extents_page_view.dart:99-105` | Opens the settings drawer |
| **Pinch on the grid** | *none* | — | Not implemented |

Multi-select entry is therefore **long-press only**; there is no "select" mode
toggle in the grid app bar.

## 4.2 Photo viewer (`DetailPage`)

| Gesture | Handler | File:line | Behaviour |
|---|---|---|---|
| Horizontal swipe between files | `PageView.builder` | `{APP}/ui/viewer/file/detail_page.dart:572`, `onPageChanged` `:639` | Next/previous file |
| Single tap | `GestureDetector.onTap` | `detail_page.dart:621-627` | Toggles full-screen chrome — **images only**; videos ignore it (`:622-625`) |
| Single tap (video) | `VideoDoubleTapSeek.onSingleTap` | `{APP}/ui/viewer/file/video_double_tap_seek.dart:139` | Toggles video controls |
| Double tap (image) | `onDoubleTapDown` + `onDoubleTap` | `{APP}/ui/viewer/file/image_zoom/image_zoom_viewer.dart:723-725`, `_onDoubleTap` `:546` | Cycles zoom stages `initial → covering → originalSize` via `ImageZoomStagePolicy.nextDoubleTapStage` (`image_zoom_stage_policy.dart:29`); zooms toward the tap point (`:539`) |
| Double tap (video) | `onDoubleTap` | `video_double_tap_seek.dart:142-147` | Seek ±; accumulates on fast repeats (`:100-104`); badge shown 750 ms (`:123`) |
| Pinch (image) | Manual 2-pointer pinch, then `InteractiveViewer` | `image_zoom_viewer.dart:414-455` (`_beginManualPinch` `:456`), `InteractiveViewer` `:709-718` | First pinch from the un-zoomed state is handled manually so the `PageView` can't steal it; once zoomed, `InteractiveViewer` owns pan + pinch (comment `:13-14`) |
| Pan while zoomed | `InteractiveViewer` | `image_zoom_viewer.dart:709` | Standard pan, with inertia |
| Pinch (video) | `InteractiveViewer` wrapped in a `Listener` | `{APP}/ui/viewer/file/zoomable_video_viewer.dart:85-88` | Listener exists purely to stop the `PageView` stealing the pinch (comment `:7`) |
| Swipe down | `GestureDetector.onVerticalDragUpdate` | `{APP}/ui/viewer/file/zoomable_image.dart:189-196`, wired `:280-283` | `Navigator.maybePop` — dismiss the viewer. Threshold `dragSensitivity = 8` (`{APP}/core/constants.dart:38`). Disabled while zoomed (`:190`), in guest view, or when `enableVerticalSwipeActions` is false |
| Swipe up | same handler | `zoomable_image.dart:193-194` | Opens `showDetailsSheet` (the Info sheet) |
| Swipe up/down on video | `onVerticalDragUpdate` | `{APP}/ui/viewer/file/video_widget_native.dart:374-378`; `video_widget_media_kit.dart:249` | Same dismiss / info behaviour |
| Long-press (live photo) | `LiveImageLongPressRouter` | `{APP}/ui/viewer/file/live_image_long_press_router.dart:19-30` | Resolves to `playback` if a motion video exists, else falls through to `textSelection` |
| Long-press (video) | `onLongPress` / `onLongPressUp` / `onLongPressCancel` | `video_double_tap_seek.dart:148-150` | Speed-up-while-held |
| Long-press (still image) | `startTextSelectionAt` | `detail_page.dart:615-619` | OCR text selection — suppressed in `minimalistic` mode and for live photos |
| Long-press on a detected QR code | `GestureDetector.onLongPress` | `{APP}/ui/viewer/file/qr_code_highlight_overlay.dart:113-115` | Opens the QR content sheet |
| Tap a filmstrip thumbnail | `GestureDetector.onTap` | `{APP}/ui/viewer/file/file_viewer_filmstrip.dart:235-237` | Jumps to that file (`FileViewerFilmstripEventType.tap`) |
| Drag the filmstrip | `Listener` + `NotificationListener<ScrollNotification>` | `file_viewer_filmstrip.dart:162-166`, `:306` | Scrubs; re-centres on release (`_requestCentering`) |
| Pan/zoom on a panorama | `PanoramaViewerScreen` | `{APP}/ui/viewer/file/panorama_viewer_screen.dart:19` | Delegated to the panorama package — **unverified** which gestures it binds |

## 4.3 Gesture-arena notes worth recording

- `image_zoom_viewer.dart:401-412` (`_updateInteractionLock`) reports a lock to
  the parent whenever ≥2 pointers are down, a manual pinch is running, a
  programmatic animation is running, or the image is zoomed. `zoomable_image.dart:277-281`
  uses that lock to disable the vertical-drag-to-dismiss handler, so a
  two-finger pinch can never be misread as a dismiss.
- `{APP}/ui/common/touch_cross_detector.dart` tracks whether a pointer id is
  still live; the grid consults it before arming swipe-select
  (`gallery_file_widget.dart:277`).
- `{APP}/ui/viewer/file/ocr/inline_text_detection.dart:822` yields gestures back
  to the image viewer while a pinch or zoom settle is in progress.

---

# 5. SETTINGS TREE

Root is `{APP}/ui/settings_page.dart:44`, mounted as the `Scaffold` **drawer**
of `HomeWidget` (`{APP}/ui/tabs/home_widget.dart:891-900`), not as a pushed
route. Everything below it is pushed with `routeToPage`.

Notation: `[toggle]` = inline `ToggleSwitchComponent`, `[sheet]` = opens a
bottom sheet, `[web]` = opens `WebPage`/external URL, `→` = pushes a screen.

```
SettingsPage                                        ui/settings_page.dart:44
│ header: title = account email; double-tap / long-press → Verify identity sheet   :78-83, :477
│ header action: Search settings → SettingsSearchPage                              :203-221
│ (search index: ui/settings/search/settings_search_registry.dart, 801 lines)
│
├─ [offline mode only] Offline banner → EmailEntryPage                             :86-97
├─ [offline mode only] "Already have an account?" → LoginPage                      :245-266
│
├─ StorageCardWidget (usage / plan)                  ui/settings/storage_card_widget.dart   :103
│
├─ Account                    → AccountSettingsPage   ui/settings/account/account_settings_page.dart:19   :105-111
│   ├─ Manage subscription    → Stripe/Store subscription page                     :30
│   ├─ Change email           [sheet] showChangeEmailBottomSheet                   :37
│   ├─ Change password        → PasswordEntryPage(update)                          :44, :140
│   ├─ Recovery key           → RecoveryKeyPage                                    :51, :169
│   ├─ Export your data                                                            :58
│   └─ Delete account         (destructive)                                        :68
│
├─ Backup                     → BackupSettingsPage    ui/settings/backup/backup_settings_page.dart:10     :113-119
│   ├─ Backed up folders      → BackupFolderSelectionPage                          :21
│   ├─ Backup status          → BackupStatusScreen    ui/settings/backup/backup_status_screen.dart:20     :30-34
│   └─ Backup settings        → BackupSettingsScreen  ui/settings/backup/backup_settings_screen.dart:16   :38-43
│       ├─ Backup over mobile data                  [toggle]                       :33
│       ├─ Backup videos                            [toggle]                       :49
│       ├─ Resumable uploads                        [toggle]  (flag enableMobMultiPart) :63-67
│       ├─ Faster uploads                           [toggle]  (flag cloudflareUploadWorker) :80-87
│       ├─ Backup mode                              → LargeBackupScreen            :95-100
│       └─ Backup only new photos                   [sheet]                        :132, :248
│
├─ Security                   → SecuritySettingsPage  ui/settings/security/security_settings_page.dart:28 :122-128
│   ├─ Two-factor             [toggle] → TwoFactorSetupPage / disable dialog       :70-77, :167
│   ├─ Email verification     [toggle]                                             :79-86
│   ├─ Passkey                → PasskeyService.openPasskeyPage                     :87-93, :250
│   ├─ App lock               (device lock / PIN / password)                       :94-99
│   ├─ Crash reporting        [toggle]                                             :100-116
│   └─ Active sessions        → SessionsPage                                       :117-118, :298
│
├─ Appearance                 → AppearanceSettingsPage ui/settings/appearance/appearance_settings_page.dart:17 :130-136
│   ├─ Theme                  [sheet] ThemeSelector (Light / Dark / System)        :47-55, :125
│   ├─ App icon               → AppIconSelectionScreen  ui/settings/app_icon_selection_screen.dart:27     :56-61
│   ├─ Language               → LanguageSelectorPage                               :64-69
│   └─ Gallery                → GallerySettingsScreen   ui/settings/gallery_settings_screen.dart:16       :70-77
│       ├─ Layout             [sheet] Grouped / Justified·Flex / Justified·Comfort / Masonry  :53, :137
│       │    (internal-only label: "Layout (i)")
│       ├─ Justified layout tuning (i) → JustifiedLayoutTuningScreen  ui/settings/justified_layout_tuning_screen.dart:10 :62
│       │    ├─ Flex: per-field numeric inputs + "Reset all"                       :36-50
│       │    └─ Comfort Large: per-field numeric inputs + "Reset all"              :53-70
│       ├─ Photo grid size    [sheet] numeric options                              :74, :200
│       ├─ Group by           [sheet] Day / Week / Month / Year                    :80, :246
│       └─ Hide shared items from home gallery  [toggle]                           :90
│
├─ [offline mode] Offline features card                                            :269-303
│   └─ Machine learning · Memories · Notifications · Widgets · Maps[toggle]
│
├─ [signed in] Personal features card                                              :305-369
│   ├─ Legacy                 → EmergencyPage (auth-gated)  emergency/emergency_page.dart:25   :309-331
│   ├─ Family                 → family portal / FamilyPlanPage                     :332-358
│   └─ Referrals              → _ReferralScreen                                    :359-366
│
├─ [signed in] Features & plans card                                               :371-429
│   ├─ Free up space          → FreeUpSpaceOptionsScreen  ui/settings/backup/free_space_options.dart:28   :374-381
│   │   ├─ Trash                    → _TrashPage                                   :50
│   │   ├─ Free up device space     → FreeSpacePage                                :57
│   │   ├─ Manage device cache      → AppStorageViewer                             :75-79
│   │   ├─ Similar images           → SimilarImagesPage   (flag enableVectorDb)    :88-96
│   │   ├─ Duplicates               → DeduplicatePage                              :101, :192
│   │   ├─ Large files              → LargeFilesPagePage                           :107-111
│   │   └─ Delete suggestions       → DeleteSuggestionsPage                        :115, :222
│   ├─ Machine learning       → MachineLearningSettingsPage  ui/settings/ml/machine_learning_settings_page.dart:28 :382-388
│   │   ├─ ML consent sheet                                                        :146-171
│   │   ├─ Enabled                  [toggle]                                       :326-336
│   │   ├─ Local processing         [toggle]                                       :340-360
│   │   ├─ Indexing progress / clustering progress / "waiting for WiFi"            :565-600
│   │   └─ [internal] ML debug options → MLUserDeveloperOptions  ui/settings/ml/ml_user_dev_screen.dart:26 :200
│   │        ├─ Remote fetch [toggle]                                              :113
│   │        ├─ Run ML on interactions [toggle]                                    :139
│   │        ├─ Auto-merge threshold                                               :213
│   │        └─ Default clustering distance                                        :226
│   ├─ Memories               → MemoriesSettingsScreen   ui/settings/memories_settings_screen.dart:11     :389-395
│   │   ├─ Show memories            [toggle]                                       :27
│   │   └─ Curated memories         [toggle]                                       :44
│   ├─ Notifications          → NotificationSettingsScreen ui/settings/notification_settings_screen.dart:7 :396-402
│   │   ├─ New shared photos and albums      [toggle]                              :65
│   │   ├─ Likes and comments                [toggle]                              :82
│   │   ├─ On this day memories              [toggle]                              :99
│   │   └─ Birthdays                         [toggle]                              :116
│   ├─ Widgets                → WidgetSettingsScreen     ui/settings/widget_settings_screen.dart:11       :403-409
│   │   ├─ People             → PeopleWidgetSettings     ui/settings/widgets/people_widget_settings.dart:16   :24
│   │   │      └─ Show text on widget [toggle]                                     :121
│   │   ├─ Albums            → AlbumsWidgetSettings     ui/settings/widgets/albums_widget_settings.dart:18    :28
│   │   │      └─ Show text on widget [toggle]                                     :153
│   │   └─ Memories          → MemoriesWidgetSettings   ui/settings/widgets/memories_widget_settings.dart:14  :32
│   │          ├─ Show text on widget [toggle]                                     :140
│   │          ├─ Past years' memories [toggle]                                    :163
│   │          ├─ On this day memories [toggle]                                    :182
│   │          └─ Smart memories       [toggle]                                    :202
│   ├─ Streamable videos      → VideoStreamingSettingsPage  ui/settings/streaming/video_streaming_settings_page.dart:17 :410-416
│   │   ├─ Enabled                 [toggle]                                        :104-111
│   │   └─ VideoStreamingStatusWidget (processed count)                            :113, :234
│   ├─ Cast sessions          → _CastSettingsPage   ui/settings/cast/cast_settings_page.dart:35           :417-425
│   │      (gated by flagService.enableMultiCast; stop-casting confirm at :162)
│   └─ Maps                   [toggle] setMapEnabled                               :431-450
│
├─ AppEngagementSection            packages/ui/.../app_engagement_section.dart     :148
│   ├─ Merchandise            [web]                                                :23
│   └─ Rate us                [web]                                                :29
│
├─ Help & Support             → HelpSupportPage   ui/settings/support/help_support_page.dart:17           :150-156
│   ├─ Ask a question         [web]                                                :40
│   ├─ Request a feature      [web]                                                :49
│   ├─ Report an issue        → ReportIssuePage   ui/settings/support/report_issue_page.dart:12           :61
│   ├─ (i) View logs          → LogFileViewer  (internal / debug only)              :70-73
│   ├─ Export logs                                                                 :81
│   ├─ Search and discovery   [web FAQ]                                            :86
│   ├─ Backup and sync        [web FAQ]                                            :94
│   ├─ Sharing and collaboration [web FAQ]                                         :102
│   ├─ Storage and plans      [web FAQ]                                            :110
│   ├─ Troubleshooting        [web FAQ]                                            :118
│   └─ View all help topics   [web]                                                :124
│
├─ About                      → AboutUsPage   ui/settings/about/about_us_page.dart:9                      :158-164
│   └─ AboutSettingsSection   packages/ui/lib/components/settings/about_settings_section.dart
│       ├─ We are open source [web github.com/ente/ente]                           :19-24
│       ├─ Blog               [web ente.com/blog]                                  :25-30
│       ├─ Privacy            [web ente.com/privacy]                               :31-36
│       ├─ Terms              [web ente.com/terms]                                 :37-42
│       └─ Check for updates  [sheet] (only when updateService.isIndependent())    :43-49
│
├─ [signed in] Logout         (destructive, confirm sheet)                         :452-475
├─ SocialIconsRow                                                                  :171
├─ AppVersionWidget           (7 taps → DeveloperSettingsPage, ui/settings/developer_settings_tap_area.dart:58) :173
│
└─ [internal user or kDebugMode]                                                   :174-193
    ├─ Debug                  → DebugSettingsPage   ui/settings/debug/debug_settings_page.dart:17         :177-183
    │   ├─ Disable internal user features   [toggle]                               :57
    │   ├─ Use Cloudflare upload proxy      [toggle]                               :83
    │   ├─ Background sync notification     [toggle]                               :113
    │   ├─ Show local ID over thumbnails    [toggle]                               :139
    │   ├─ Christmas banner                 [toggle]                               :166
    │   ├─ Show change log     → ChangeLogPage                                     :189, :202
    │   └─ Social settings     → SocialDebugScreen  ui/settings/debug/social_debug_screen.dart:9          :215, :226
    │        ├─ Trigger social sync / collection sync                              :42, :54
    │        ├─ Seed example data                                                  :65
    │        └─ Delete all comments / reactions                                    :76, :88
    └─ ML Debug               → MLDebugSettingsPage  ui/settings/debug/ml_debug_settings_page.dart:31     :185-191
        └─ Memories debug     → MemoriesDebugPage    ui/settings/debug/memories_debug_page.dart:20        :895
```

Reachable from settings but not linked from the root tree:

| Screen | File | Entry |
|---|---|---|
| `DeveloperSettingsPage` (custom server endpoint) | `ui/settings/developer_settings_page.dart:13` | `ui/settings/developer_settings_tap_area.dart:58` (tap the version string) |
| `PendingSyncInfoScreen` | `ui/settings/pending_sync/pending_sync_info_screen.dart:9` | `ui/tools/debug/path_storage_viewer.dart:119` |
| `SettingsSearchPage` | `{PKG}/ui/lib/pages/settings_search_page.dart` | Search icon in the settings header (`ui/settings_page.dart:210`) |

---

# 6. STATE COVERAGE

## 6.1 The shared machinery

`Gallery` (`{APP}/ui/viewer/gallery/gallery.dart`) is the single widget behind
almost every photo-list screen. It exposes **two** injectable states and no
error state:

| Slot | Default | Where rendered |
|---|---|---|
| `emptyState` | `const EmptyState()` — a centred grey `nothingToSeeHere` string (`{APP}/ui/viewer/gallery/empty_state.dart:5-26`) | `gallery.dart:942` |
| `loadingWidget` | `const EnteLoadingWidget()` | `gallery.dart:888`, `:900` |
| *error* | **none** — `_loadFiles` logs `severe` and rethrows (`gallery.dart:732-735`); nothing catches it, so a load failure shows the loading spinner forever | — |

Two richer empty-state components exist and are used selectively:
`EmptyStateComponent` (`{APP}/ui/components/empty_state_component.dart:4`,
7 call sites) and `EmptyAlbumState`
(`{APP}/ui/viewer/gallery/empty_album_state.dart:10`).

The only app-level **error surface** is `HeaderErrorWidget`
(`{APP}/ui/home/header_error_widget.dart:11`), a banner mounted once on the
Home tab (`{APP}/ui/home/status_bar_widget.dart:149`). It recognises exactly
two errors — `NoActiveSubscriptionError` (`:18`) and
`StorageLimitExceededError` (`:36`). Everywhere else, errors surface as a
modal `showGenericErrorDialog` or a toast, never as an in-place state.

## 6.2 Per-screen table

Legend: **Y** = dedicated widget for that state · **inherited** = gets the
`Gallery` default, not a screen-specific design · **N** = none.

| Screen | Empty | Loading | Error | File |
|---|---|---|---|---|
| Home gallery | inherited (`EmptyState`) | inherited (`EnteLoadingWidget`) | **partial** — `HeaderErrorWidget` banner for 2 error types only | `ui/home/home_gallery_widget.dart:29`; banner `ui/home/status_bar_widget.dart:149` |
| Albums tab | **Y** — 4 distinct empty states: `OnEnteEmptyState` (`:615`), `SharedEmptyState` (`:619`), `ReceivedEmptyState` (`:623`), `OnDeviceEmptyState`; plus a search-empty sliver (`:497-500`) | **Y** (`:462`) | **N** | `ui/tabs/albums_tab.dart:401-623`; states in `ui/tabs/albums/empty_states/` |
| Search tab | **Y** — `SearchTabEmptyState` (`:236`) and `NoResultWidget` | **Y** (`:348`, `:353`) | **Y** — `snapshot.hasError` branch (`:334`) | `ui/viewer/search_tab/search_tab.dart` |
| Feed tab | **Y** — `FeedEmptyState` | **Y** — `_isLoading` spinner (`:564-565`) + `_isLoadingMore` | **N** | `ui/social/feed_screen.dart:83`; `ui/social/widgets/feed_empty_state.dart:9` |
| `CollectionPage` | **Y** — `EmptyAlbumState` for owned albums, `EmptyState` otherwise (`:106-118`) | inherited | **N** | `ui/viewer/gallery/collection_page.dart:48-118` |
| `_TrashPage` | **Y** — `EmptyStateComponent` (`:138`) | inherited | **N** | `ui/viewer/gallery/trash_page.dart` |
| `ArchivePage` | **Y** — `EmptyStateComponent` (`:127-128`) | inherited | **N** | `ui/viewer/gallery/archive_page.dart` |
| `HiddenPage` | **Y** — `EmptyStateComponent` (`:173-174`) | **Y** (`:130`) | **N** | `ui/viewer/gallery/hidden_page.dart` |
| `UnCategorizedPage` | **Y** — `EmptyStateComponent` (`:89`) | inherited | **N** | `ui/viewer/gallery/uncategorized_page.dart` |
| `PeoplePage` | inherited | inherited | **N** | `ui/viewer/people/people_page.dart:360` |
| `ClusterPage` | inherited | inherited | **N** | `ui/viewer/people/cluster_page.dart:211` |
| `SearchResultPage` | inherited | inherited | **N** | `ui/viewer/search/result/search_result_page.dart:82` |
| `MagicResultScreen` | inherited | inherited | **N** | `ui/viewer/search/result/magic_result_screen.dart:184` |
| `PeopleSectionAllPage` | **Y** — `noResultsFound` text (`:687`) | **Y** (`:665`) | **Y** — `hasError` branch (`:669`) | `ui/viewer/search/result/people_section_all_page.dart` |
| `DeviceFolderPage` | inherited | inherited | **N** | `ui/viewer/gallery/device/device_folder_page.dart:27` |
| `LargeFilesPagePage` | **N** — no empty branch found | **N** | **N** | `ui/viewer/gallery/large_files_page.dart:25` |
| `DeleteSuggestionsPage` | inherited (empty `FileLoadResult`, `:42-44`); a pre-entry dialog `noDeleteSuggestion` guards it at `ui/settings/backup/free_space_options.dart:216-217` | inherited | **N** | `ui/viewer/gallery/delete_suggestions_page.dart:37-56` |
| `DeduplicatePage` | **Y** — `EmptyState()` (`:113`) | **N** | **partial** — `showGenericErrorDialog` (`:237`) | `ui/tools/deduplicate_page.dart` |
| `SimilarImagesPage` | **unverified** (no explicit empty branch located) | **Y** — custom `_LoadingScreen` with rotating copy (`:307`, `:1252-1333`) | **partial** — 3 × `showGenericErrorDialog` (`:664`, `:967`, `:982`) | `ui/tools/similar_images_page.dart` |
| `MapScreen` | **N** | **Y** — `isLoading` + `EnteLoadingWidget` (`:400-404`) | **N** | `ui/map/map_screen.dart` |
| `LocationScreen` | inherited | **Y** (`loadingWidget`) | **N** | `ui/viewer/location/location_screen.dart:32` |
| `SessionsPage` | **N** | **Y** (`:47`) | **N** | `ui/account/sessions_page.dart` |
| `_CastSettingsPage` | **Y** — `noSessionsFound` (`:59`) | **N** | **N** | `ui/settings/cast/cast_settings_page.dart:35` |
| `AllLinksPage` | **Y** — `EmptyStateComponent` + `activeLinksWillShowUpHere` (`:251-253`) | **N** | **N** | `ui/tabs/shared/all_links_page.dart` |
| `BackupStatusScreen` | **Y** — `_EmptyBackupStatus` (`:116`, `:144`) | **N** | **N** | `ui/settings/backup/backup_status_screen.dart` |
| `AllRitualsScreen` | **Y** — `StartNewRitualCard` when `rituals.isEmpty` (`:82-85`) | **N** | **N** | `ui/rituals/all_rituals_screen.dart` |
| `FamilyPlanPage` | **N** | **N** | **partial** — 6 × `showGenericErrorDialog` (`:480`, `:822`, `:843`, `:864`, `:885`, `:909`) | `ui/family/family_plan_page.dart` |
| `_ReferralScreen` | **N** | **Y** (`:139`) | **Y** — `hasError` branch (`:104`) + dialog (`:39`) | `ui/growth/referral_screen.dart` |
| `ShareCollectionPage` | **Y** — `emptyAlbumShareMessage` description (`:84`) | **N** | **N** | `ui/sharing/share_collection_page.dart:21` |
| `CollectionListPage` | **N** | **N** | **N** | `ui/collections/collection_list_page.dart:30` |
| `WrappedViewerPage` | **N** | **partial** — `_isPreviewLoading` on media only (`:603`, `:904`) | **N** | `ui/wrapped/wrapped_viewer_page.dart` |
| `SharedPublicCollectionPage` | inherited | inherited | **partial** — one dialog | `ui/viewer/gallery/shared_public_collection_page.dart:34` |
| `AllMemoriesPage` / `FullScreenMemory` | **N** | **N** (`_DelayedLoadingIndicator` inside `zoomable_image.dart:245`) | **N** | `ui/home/memories/all_memories_page.dart:63` |
| `MemoryLanePage` / `V2` | **N** | **Y** — "Faces timeline is preparing" / feature-off screen (`memory_lane_page.dart:612-626`, `:705`; `memory_lane_page_v2.dart:701`, `:732`) | **N** | `ui/viewer/people/memory_lane_page.dart:31` |

## 6.3 Screens flagged with **no** dedicated empty, loading, or error state

- `LargeFilesPagePage` — `ui/viewer/gallery/large_files_page.dart:25`
- `CollectionListPage` — `ui/collections/collection_list_page.dart:30`
- `ShareCollectionPage` — `ui/sharing/share_collection_page.dart:21`
- `AllMemoriesPage` + `FullScreenMemory` — `ui/home/memories/all_memories_page.dart:63`, `full_screen_memory.dart:71`
- `WrappedViewerPage` — only a per-media loading flag; no page-level empty or error — `ui/wrapped/wrapped_viewer_page.dart:70`

## 6.4 Systemic observations

1. **No screen in the app has an in-place error state for a failed gallery
   load.** `Gallery` has no `errorWidget` slot at all; the rethrow at
   `gallery.dart:734` is uncaught, so the screen keeps showing
   `loadingWidget`.
2. **19 of the 33 screens above inherit the generic `EmptyState`**, which is a
   single grey line of text (`nothingToSeeHere`) with no illustration and no
   call to action.
3. **`showGenericErrorDialog` is the de-facto error UI**: 143 occurrences in
   61 files under `{APP}` (128 of them under `{APP}/ui/`). It is modal and
   carries no retry affordance.
4. At least one empty-state string is declared but unreferenced anywhere in
   `{APP}` or `{PKG}`: `trashIsEmpty` (0 references; the trash screen uses
   `EmptyStateComponent` with different copy at
   `ui/viewer/gallery/trash_page.dart:138`).

---

# 7. COMPONENT INVENTORY

Call-site counts were produced with:

```sh
# occurrences of the class name outside its own file, excluding import/export lines
grep -rn --include=*.dart -E "\b<Class>\b" apps/photos/lib packages \
  | grep -v ":import " | grep -v ":export " | grep -v "^<defining file>:"
```

`files` = number of distinct `.dart` files that reference the class (also
excluding the defining file). A count of `0 | 0` means the class is defined but
never referenced anywhere in `apps/` or `packages/` — i.e. dead.

## 7.1 `{PKG}/ente_components/lib` — the current design system

Most of these carry a Figma node link in their header comment (e.g.
`components/button_component.dart:1`), so this is the actively-maintained layer.

| Component | Purpose | Uses | Files |
|---|---|---|---|
| `ButtonComponent` | Primary button (all variants, execution states) | 258 | 139 |
| `BottomSheetComponent` | Standard bottom sheet shell | 155 | 96 |
| `MenuComponent` | Settings/menu row | 132 | 52 |
| `TextInputComponent` | Text field | 117 | 55 |
| `SettingsItem` | Settings row with icon + trailing | 116 | 32 |
| `EntePopupMenuOption` | One item in an overflow menu | 104 | 23 |
| `IconButtonComponent` | Icon-only button | 79 | 56 |
| `ToggleSwitchComponent` | Switch (incl. `.async`) | 54 | 26 |
| `AppBarComponent` | Standard app bar | 52 | 41 |
| `MenuGroupComponent` | Grouped card of `MenuComponent`s | 52 | 34 |
| `ComponentTheme` | Theme accessor (`context.componentColors`) | 48 | 31 |
| `SettingsPageScaffold` | Scaffold used by every settings screen | 37 | 36 |
| `FilterChipComponent` | Filter chip (albums tab, large files) | 35 | 13 |
| `SliverAppBarComponent` | Collapsing app bar for galleries | 25 | 6 |
| `EntePopupMenuButton` | Overflow (⋮) trigger | 21 | 15 |
| `LabeledControlComponent` | Checkbox/radio with label | 13 | 6 |
| `BannerComponent` | Inline banner (home status bar, ML, backup) | 12 | 5 |
| `TagChipComponent` | Tag chip | 11 | 6 |
| `CheckboxComponent` | Checkbox | 10 | 8 |
| `TooltipComponent` | Tooltip | 9 | 4 |
| `AvatarComponent` | User avatar | 6 | 2 |
| `PinInputComponent` | PIN entry | 6 | 4 |
| `RadioComponent` | Radio button | 6 | 5 |
| `SelectionSummaryChipComponent` | "n selected" chip | 6 | 3 |
| `TooltipBubbleComponent` | Tooltip bubble | 6 | 2 |
| `HeaderAppBarTitleState` | App-bar title state model | 5 | 3 |
| `ChipIconSlot` | Icon slot inside a chip | 5 | 3 |
| `DividerComponent` | Divider | 4 | 4 |
| `FABComponent` | Floating action button | 4 | 4 |
| `HeaderAppBarGeometry` | App-bar sizing model | 4 | 3 |
| `SettingsLink` | Inline link row in settings | 4 | 2 |
| `AndroidTextInputAutofocus` | Android autofocus workaround | 3 | 3 |
| `ChipSurface` | Chip background | 3 | 3 |
| `StepperComponent` | Numeric stepper | 3 | 1 |
| `ComponentColorTokens` | Colour token bag | 3 | 1 |
| `CenteredConstrainedComponent` | Max-width wrapper | 2 | 2 |
| `EnteAppIcon` | App icon renderer | 2 | 2 |
| `MenuComponentSurfaceStyle` | Menu surface style enum | 2 | 2 |
| `SliderComponent` | Slider | 2 | 1 |

Theme/token classes in the same package (occurrences shown, not widgets):
`Spacing` 792 / 135 files · `TextStyles` 583 / 240 · `IconSizes` 231 / 87 ·
`Radii` 94 / 61 · `ColorTokens` 51 / 28 · `Motion` 42 / 24.

**Dead in `ente_components`:** `PrimaryColorTokens`
(`theme/colors.dart`, 0 refs) and `Shadows` (`theme/shadows.dart`, 0 refs) —
the latter despite the brief naming three shadow tiers; the tiers that are used
come from `{APP}/theme/`.

Two entries in the package are functions rather than classes, so they are not
in the table above: `showToastComponent`
(`components/toast_component.dart:8`, 7 call sites) and
`showErrorBottomSheetComponent`
(`components/bottom_sheet/error_bottom_sheet_component.dart:7`, 1 call site).

## 7.2 `{PKG}/ui/lib` — the older shared UI package

This package duplicates several `ente_components` widgets (`ButtonWidget`,
`TextInputWidget`, `BaseBottomSheet`, `AlertBottomSheet`, `MenuItemWidgetV2`,
`CustomButtonStyle`, `TrailingWidget`/`LeadingWidget`) and is still live.

| Component | Purpose | Uses | Files |
|---|---|---|---|
| `ButtonWidget` | Legacy button | 164 | 53 |
| `EnteColorScheme` | Legacy colour scheme | 135 | 41 |
| `SettingsSearchItem` | Settings search index entry | 98 | 3 |
| `EnteLoadingWidget` | The app-wide spinner | 90 | 78 |
| `EnteTextTheme` | Legacy text theme | 82 | 29 |
| `ButtonResult` | Button result model | 69 | 24 |
| `ProgressDialog` | Blocking progress dialog | 49 | 23 |
| `GradientButton` | Gradient CTA | 34 | 15 |
| `EnteTheme` | Theme accessor | 20 | 11 |
| `DividerWidget` | Divider | 13 | 12 |
| `NoScalingAnimation` | FAB animation helper | 12 | 12 |
| `DynamicFAB` | FAB used across onboarding | 11 | 11 |
| `DialogWidget` | Legacy dialog | 9 | 3 |
| `FileIconConfig` | File-type icon config | 9 | 1 |
| `SettingsSearchSuggestion` | Settings search suggestion | 8 | 3 |
| `PlatformTextConfig` | Platform text metrics | 8 | 1 |
| `TextInputWidget` | Legacy text field | 8 | 4 |
| `LanguageSelectorPage` | Language picker screen | 7 | 6 |
| `TrailingWidget` | Menu trailing slot | 7 | 3 |
| `ButtonChildWidget` | Button inner content | 6 | 1 |
| `CustomButtonStyle` | Button style model | 6 | 3 |
| `TextInputDialog` | Text-input dialog | 6 | 3 |
| `CaptionedTextWidgetV2` | Caption + text row | 5 | 2 |
| `LogFileViewer` | Log viewer screen | 5 | 5 |
| `MenuItemWidgetV2` | Menu row | 5 | 2 |
| `AppThemeConfig` | Theme config model | 4 | 4 |
| `AboutSettingsSection` | About links block | 3 | 3 |
| `ActionSheetWidget` | Action sheet | 3 | 1 |
| `AlertBottomSheet` | Alert sheet | 3 | 1 |
| `AppEngagementSection` | Merch + rate-us block | 3 | 3 |
| `AppVersionWidget` | Version string (+7-tap easter egg) | 3 | 3 |
| `BaseBottomSheet` | Sheet shell | 3 | 1 |
| `ColorSchemeBuilder` | Colour scheme builder | 3 | 1 |
| `ExpansionTrailingIcon` | Chevron for expandable rows | 3 | 2 |
| `FileIconUtils` | File-type icon helper | 3 | 3 |
| `LeadingWidget` | Menu leading slot | 3 | 2 |
| `SocialIconsRow` | Social links row | 3 | 3 |
| `SuffixIconWidget` | Text-field suffix | 3 | 1 |
| `ThemeSelector` | Light/Dark/System picker | 3 | 3 |
| `Actions` | Dialog action row | 3 | 2 |
| `CloseIconButton` | Close (×) button | 2 | 2 |
| `FadingCircleProgressIndicator` | Progress spinner variant | 2 | 2 |
| `LanguageSelectorList` | Language list | 2 | 2 |
| `SettingsSearchPage` | Settings search screen | 2 | 2 |
| `DateTimePicker` | Date/time picker | 1 | 1 |

**Dead in `{PKG}/ui`:** `ContentContainerWidget`, `ActionButtons`
(`components/action_sheet_widget.dart`), `ContentContainer`
(`components/dialog_widget.dart`), `LeadingWidgetV2`
(`components/menu_item_widget_v2.dart`), and the entire demo file
`theme/multi_app_demo.dart` (`ECommerceApp`, `SocialMediaApp`, `FinanceApp`,
`GamingApp`, `MultiAppThemeDemo`, `DemoHomePage` — all 0 refs).

## 7.3 `{APP}/ui/components` — app-local components

| Component | Purpose | Uses | Files |
|---|---|---|---|
| `ButtonWidget` | App-local legacy button (distinct from `{PKG}/ui`'s) | 116 | 40 |
| `SelectionActionButton` | One action in the multi-select bar | 67 | 3 |
| `MenuItemWidgetNew` | Menu row | 53 | 12 |
| `ButtonWidgetV2` | v2 button | 47 | 19 |
| `ThumbnailListItem` | Thumbnail row item | 25 | 10 |
| `ToggleSwitchWidget` | App-local toggle | 18 | 5 |
| `IconButtonWidget` | App-local icon button | 17 | 14 |
| `SettingsGroupedCard` | Grouped settings card | 8 | 3 |
| `TextInputWidget` | App-local text field | 8 | 4 |
| `CollectionSelectedBadge` | Album "selected" badge | 7 | 7 |
| `EmptyStateComponent` | Rich empty state (icon + title + body + CTA) | 7 | 7 |
| `ButtonChildWidget` | Button content | 6 | 1 |
| `InfoItemWidget` | Info-sheet row | 6 | 5 |
| `TitleBarTitleWidget` | Title bar title | 6 | 6 |
| `TrailingWidget` | Menu trailing slot | 6 | 3 |
| `CustomButtonStyle` | Button style model | 6 | 3 |
| `MenuSectionTitle` | Section heading | 5 | 3 |
| `BannerActionButton` | Banner CTA | 4 | 4 |
| `KeyboardOverlay` | Keyboard accessory overlay | 4 | 2 |
| `EmptyStateItemWidget` | Bullet row inside an empty state | 4 | 1 |
| `ButtonColors` | Button colour model | 4 | 1 |
| `AlertBottomSheet` | Alert sheet | 3 | 1 |
| `BaseBottomSheet` | Sheet shell | 3 | 1 |
| `BottomOfTitleBarWidget` | Sub-title bar | 3 | 3 |
| `CollectionLinkBadge` | Album "has link" badge | 3 | 3 |
| `PinnedBadge` | Album "pinned" badge | 3 | 3 |
| `ExpansionTrailingIcon` | Chevron | 3 | 2 |
| `LeadingWidget` | Menu leading slot | 3 | 2 |
| `TextInputWidgetV2` | v2 text field | 3 | 2 |
| `TextInputColors` | Text-field colour model | 3 | 1 |
| `SuffixIconWidget` | Text-field suffix | 3 | 1 |
| `BlurMenuItemWidget` | Blurred menu row (viewer overlays) | 2 | 1 |
| `ButtonComponentAdapter` | Bridges `ButtonWidget` → `ButtonComponent` | 2 | 2 |
| `CollectionUnSyncedBadge` | Album "not synced" badge | 2 | 2 |
| `KeyboardTopButton` | Keyboard "Done" bar | 2 | 2 |
| `MenuSectionDescriptionWidget` | Section description | 2 | 2 |
| `SearchableAppBar` | App bar with inline search | 2 | 2 |
| `ActionBarWidget` | Multi-select bar header | 1 | 1 |
| `AlbumActionBarWidget` | Album multi-select header | 1 | 1 |
| `AlbumBottomActionBarWidget` | Album multi-select bar | 1 | 1 |
| `BottomActionBarWidget` | File multi-select bar | 1 | 1 |
| `PeopleActionBarWidget` | People multi-select header | 1 | 1 |
| `PeopleBottomActionBarWidget` | People multi-select bar | 1 | 1 |
| `BottomSheetCloseButton` | Sheet close button | 1 | 1 |
| `CollectionArchivedBadge` | Album "archived" badge | 1 | 1 |
| `CollectionFavoriteBadge` | Album "favourite" badge | 1 | 1 |
| `CollectionShareBadge` | Album "shared" badge | 1 | 1 |
| `EndToEndBanner` | E2EE reassurance banner | 1 | 1 |
| `GetStartedBanner` | Sign-up CTA banner | 1 | 1 |
| `HomeHeaderWidget` | Home hamburger + upload row | 1 | 1 |
| `LegacyTextInputDialog` | Legacy text dialog | 1 | 1 |
| `MLProgressBanner` | ML indexing progress banner | 1 | 1 |
| `NameFaceBanner` | "Give this face a name" banner | 1 | 1 |
| `NotificationTipWidget` | Tip notification | 1 | 1 |
| `OfflineSettingsBanner` | Offline-mode settings banner | 1 | 1 |
| `SaveFacesBanner` | "Want to save these faces?" banner | 1 | 1 |

**Dead in `{APP}/ui/components`:** `LegacyActionSheetWidget`,
`ExpandedMenuWidget`, `FilterPillWidget`, `InlineButtonWidget`,
`CaptionedTextWidget`, `CollectionStatusBadge`, `LegacyDialogWidget`,
`ButtonTheme`, `TextInputTheme`, `NotificationWidget`,
`NotificationNoteWidget` — all 0 references.

## 7.4 Duplication observed

The same concept exists in up to three places at once:

| Concept | `{APP}/ui/components` | `{PKG}/ui/lib` | `{PKG}/ente_components/lib` |
|---|---|---|---|
| Button | `ButtonWidget` (116), `ButtonWidgetV2` (47) | `ButtonWidget` (164) | `ButtonComponent` (258) |
| Text field | `TextInputWidget` (8), `TextInputWidgetV2` (3) | `TextInputWidget` (8) | `TextInputComponent` (117) |
| Bottom sheet | `BaseBottomSheet` (3), `AlertBottomSheet` (3) | `BaseBottomSheet` (3), `AlertBottomSheet` (3) | `BottomSheetComponent` (155) |
| Menu row | `MenuItemWidgetNew` (53) | `MenuItemWidgetV2` (5) | `MenuComponent` (132) |
| Toggle | `ToggleSwitchWidget` (18) | — | `ToggleSwitchComponent` (54) |
| Icon button | `IconButtonWidget` (17) | — | `IconButtonComponent` (79) |
| Colour tokens | — | `EnteColorScheme` (135) | `ColorTokens` (51) / `ComponentTheme` (48) |

`ButtonComponentAdapter` (`{APP}/ui/components/buttons/button_component_adapter.dart`,
2 refs) exists specifically to bridge the old button API onto the new one.

---

# 8. FEATURE FLAGS

Source: `{PKG}/feature_flag/lib/` — three files only:
`ente_feature_flag.dart` (barrel), `src/remote_flags.dart` (the wire model),
`src/flag_service.dart` (the accessor).

## 8.1 How flags arrive

- `FlagService` fetches `GET /remote-store/feature-flags` 5 s after
  construction (`src/flag_service.dart:24-26`, `:194`) and caches the JSON in
  `SharedPreferences` under `remote_flags` (`:204`).
- `RemoteFlags.defaultValue` (`src/remote_flags.dart:69-83`) is the fallback if
  the fetch fails or the key is missing.
- Three flags are **writable from the client** and pushed back to the server via
  `POST /remote-store/update`: `mapEnabled` (`:150`), `faceSearchEnabled`
  (`:155`), `recoveryKeyVerified` (`:160`).
- `serverApiFlag` is an **integer bitfield**; individual bits are decoded by
  `_isServerFlagEnabled` (`:243`).
- `cloudflareUploadWorker` uses a **percentage rollout** keyed on `user_id % 100`
  (`_isInUserRollout`, `:246-255`).

## 8.2 Wire fields (`src/remote_flags.dart:7-19`)

| Field | Type | Default (`:69-83`) |
|---|---|---|
| `enableStripe` | bool | `Platform.isAndroid` |
| `disableCFWorker` | bool | `false` |
| `mapEnabled` | bool | `false` |
| `faceSearchEnabled` | bool | `false` |
| `recoveryKeyVerified` | bool | `true` |
| `internalUser` | bool | `kDebugMode` |
| `betaUser` | bool | `kDebugMode` |
| `enableMobMultiPart` | bool | `false` |
| `serverApiFlag` | int (bitfield) | `0` |
| `castUrl` | String | `https://cast.ente.com` |
| `embedUrl` | String | `https://embed.ente.com` |
| `customDomain` | String | `""` |
| `customDomainCNAME` | String | `my.ente.com` |

Bit constants (`src/flag_service.dart:12-16`):
`_commentsFlag = 1<<1`, `_videoStreamingFlag = 1<<3`,
`_castSessionsV2Flag = 1<<5`, `_librarySharingFlag = 1<<7`,
`_cfUploadWorkerRolloutPercent = 50`.

## 8.3 What each accessor gates

Server-driven (value comes from the API):

| Accessor | Definition | Gates |
|---|---|---|
| `internalUser` | `:51-54` (server flag OR `kDebugMode`, minus a local kill switch `ls.internal_user_disabled`) | Debug + ML Debug entries in settings (`{APP}/ui/settings_page.dart:176`); "(i) View logs" (`ui/settings/support/help_support_page.dart:70`); `GalleryDownloadBanner` (`ui/tabs/home_widget.dart:1151`); debug thumbnail concurrency 45/15 vs 15/5 (`ui/viewer/file/thumbnail_widget.dart:131`, `:148`); memory-lane entry on `ClusterPage` (`ui/viewer/people/cluster_page.dart:180`, `:203`, `:209`); cluster-breakup debug action (`ui/viewer/people/cluster_app_bar.dart:206`); suggest-delete button in the viewer bottom bar (`ui/viewer/file/file_bottom_bar.dart:144`); ~56 references in total |
| `betaUser` | `:66` | Only via `isBetaUser` / `internalOrBetaUser`; **no direct UI call site found** |
| `internalOrBetaUser` | `:68` | **0 call sites** outside the flag service |
| `isBetaUser` | `:74` | **0 call sites** outside the flag service |
| `mapEnabled` | `:72` | Maps toggle in settings (`{APP}/ui/settings_page.dart:436-440`) and every map entry point |
| `hasGrantedMLConsent` (`faceSearchEnabled`) | `:78` | All ML surfaces: faces/pets rows in the Info sheet, People section, auto-add people, memory lane, vector DB; ~55 references |
| `recoveryKeyVerified` | `:76` | Home "verify your recovery key" banner (`ui/home/status_bar_widget.dart:226`) |
| `enableStripe` | `:70` (forced `false` on iOS) | Which subscription page is shown (`ui/payment/subscription.dart:11`) |
| `disableCFWorker` | `:49` | Upload path (`module/upload/service/file_uploader.dart:125`, `multipart.dart:74`) and download URL choice (`module/download/file_url.dart:27`, `:52`) |
| `enableMobMultiPart` | `:80` | "Resumable uploads" toggle (`ui/settings/backup/backup_settings_screen.dart:63`), settings search entry (`ui/settings/search/settings_search_registry.dart:169`), sync + multipart logic (`services/sync/remote_sync_service.dart:972`, `module/upload/service/multipart.dart:80`) |
| `castUrl` | `:93` | Pairing instructions copy (`ui/cast/pair_with_code.dart:77`) |
| `customDomain` | `:95` | Public link URL construction (`services/collections_service.dart:1206`) |
| `embedUrl` | `:97` | Embed HTML for a public link (`services/collections_service.dart:1237`) |
| `customDomainCNAME` | model field | **No call site found** in `{APP}` |

Derived from `serverApiFlag` bits:

| Accessor | Definition | Gates |
|---|---|---|
| `isSocialEnabled` | `:112` (`internalUser` OR bit 1) | **0 call sites** anywhere in `mobile/` outside the flag service — the Feed tab and comments/likes UI are *not* gated by it on this commit |
| `streamEnabledByDefault` | `:106` (bit 3) | Default value of the video-streaming preference (`services/video_preview_service.dart:128`) |
| `enableMultiCast` | `:135` (`internalUser` OR bit 5) | "Cast sessions" settings row (`{APP}/ui/settings_page.dart:417`); multi-session cast flow (`ui/cast/cast.dart:30`, `:62`, `:108`); cast icon variant in the album overflow (`ui/viewer/gallery/gallery_app_bar_widget.dart:867`) |
| `librarySharing` | `:58` (`internalUser` OR bit 7) | Library-sharing entry on the family page (`ui/family/family_plan_page.dart:90`) and its startup init (`main.dart:541`) |
| `cloudflareUploadWorker` | `:63` (`internalUser` OR 50 % rollout) | "Faster uploads" toggle (`ui/settings/backup/backup_settings_screen.dart:83`), debug toggle (`ui/settings/debug/debug_settings_page.dart:91`), upload path (`module/upload/service/file_uploader.dart:127`) |

Hard-coded accessors — these are **not** remote flags; they are compile-time
constants or aliases, and each is a latent kill switch:

| Accessor | Value | Gates |
|---|---|---|
| `offlineLinkSharing` | `= internalUser` (`:56`) | "(i) Offline link" in multi-select (`ui/viewer/actions/file_selection_actions_widget.dart:656`) |
| `webGPUEnabled` | `true` (`:61`) | ML execution policy (`services/machine_learning/webgpu_execution_policy.dart:16`) |
| `enableVectorDb` | `= hasGrantedMLConsent` (`:82`) | "Similar images" in Free up space (`ui/settings/backup/free_space_options.dart:88`), settings search (`ui/settings/search/settings_search_registry.dart:613`), ML DB orchestration (`db/ml/ml_data_db_orchestration.dart:195`, `:256`, `:929`) |
| `usearchForSearch` | `true` (`:84`) | Semantic search path (`services/machine_learning/semantic_search/semantic_search_service.dart:79`, `:83`); ML debug row (`ui/settings/debug/ml_debug_settings_page.dart:204`) |
| `usearchForSuggestions` | `true` (`:86`) | Face-cluster suggestions (`services/machine_learning/face_ml/feedback/cluster_feedback.dart:1543`, `:1564`) |
| `rustMlDb` | `false` (`:91`, with an explicit staged-rollout comment at `:88-90`) | Rust vs Dart ML DB (`main.dart:323`, `:475`) |
| `useNativeVideoEditor` | `true` (`:99`) | Native vs FFmpeg export in the video editor (`ui/tools/editor/video_editor_page.dart:67`, `:245`) |
| `facesTimeline` | `true` (`:101`) | Memory-lane availability (`services/memory_lane/memory_lane_service.dart:69`) |
| `ritualsFlag` | `true` (`:102`) | Rituals everywhere (`ui/viewer/search_tab/search_tab.dart:368`, `ui/rituals/all_rituals_screen.dart:30`, `ritual_camera_page.dart:258`, `:643`, `rituals_banner.dart:33`) |
| `stopStreamProcess` | `true` (`:104`) | Video-preview lifecycle (`services/video_preview_service.dart:73`, `:143`, `:157`, `:164`, `:171`) |
| `manualTagFileToPerson` | `= hasGrantedMLConsent` (`:108`) | "Add to person" in multi-select (`ui/viewer/actions/file_selection_actions_widget.dart:412`) and in the Info sheet (`ui/viewer/file_details/file_info_faces_item_widget.dart:197`, `:299`) |
| `enableShareePin` | `true` (`:110`) | Sharee pin/unpin in album multi-select (`ui/viewer/actions/album_selection_action_widget.dart:203`) |
| `enableMemoryShareLink` | `true` (`:115`) | Share-a-memory link (`ui/home/memories/full_screen_memory.dart:1607`, `ui/viewer/people/memory_lane_page.dart:125`, `memory_lane_page_v2.dart:575`, `:926`) |
| `enableMLInBackground` | `true` (`:117`) | Background ML scheduling (`main.dart:386`) |
| `useRustForHeicDecoder` | `= internalUser` (`:119`) | HEIC decode path (`ui/viewer/file/zoomable_image.dart:585`) |
| `petEnabled` | `= internalUser` (`:121`) | Pet recognition — Info-sheet pets row (`ui/viewer/file/file_details_widget.dart:203`), model download (`services/machine_learning/ml_model_download_service.dart:168`), indexing (`ml_indexing_isolate.dart:205`, `utils/ml_util.dart:111`, `:186`) |
| `qrFeatureEnabled` | `true` (`:123`) | QR detection in the viewer (`ui/viewer/file/detail_page.dart:261`) |
| `ocrOverlayEnabled` | `true` (`:125`) | OCR text overlay in the viewer (`ui/viewer/file/detail_page.dart:389`, `:614`) |
| `rustOcr` | `= internalUser` (`:127`) | OCR engine choice (`services/machine_learning/ocr_service.dart:29`) |
| `enableBgLocalUploadPriority` | `= internalUser` (`:129`) | Upload ordering (`services/sync/remote_sync_service.dart:673`) |
| `syncRecoveryDiagnostics` | `= internalUser` (`:131`) | Sync diagnostics (`services/sync/remote_sync_service.dart:424`, `:486`, `services/sync/local_sync_service.dart:264`, `:374`) |
| `mLHydrationStaleFileRecovery` | `= internalUser` (`:133`) | ML hydration recovery (`utils/ml_util.dart:603`) |

## 8.4 Notes

- `flagService.internalUser` is the single biggest gate in the codebase
  (~56 references) and is also the backing value for 7 other accessors. A
  redesign that surfaces internal-only affordances to everyone would expose
  Debug, ML Debug, the offline-link action, pet recognition, memory lane on
  clusters, and the download banner.
- There is a **user-facing kill switch for internal mode**: "Disable internal
  user features" in Debug settings writes `ls.internal_user_disabled`
  (`{APP}/ui/settings/debug/debug_settings_page.dart:57`, read at
  `src/flag_service.dart:52`).
- Flags are read synchronously on every access and re-parse the cached JSON
  whenever the string changes (`src/flag_service.dart:32-47`), so flag flips
  take effect without a restart.

---

# 9. FEATURE CENSUS FROM STRINGS

## 9.1 Source and method

There is **exactly one** localisation source for the mobile app:
`{PKG}/strings/lib/l10n/arb/` — 57 `.arb` files, base locale `strings_en.arb`
(5068 lines, **2142 user-facing keys**). There are **no `.arb` or `l10n`
files under `{APP}`**; `{APP}/lib/generated/` contains only `protos`.

The package is **shared across all three Ente mobile apps** (`mobile/apps/` =
`auth`, `locker`, `photos`), so not every key implies a Photos feature. Key
reachability, computed by intersecting every `.<identifier>` token in the Dart
sources against the key set:

| Bucket | Count |
|---|---|
| Reachable from `apps/photos` or `packages/` | 1750 |
| Reachable only from `apps/auth` or `apps/locker` | 372 |
| Not referenced by any of the three apps or the shared packages | 20 |

The 20 fully-unreferenced keys are listed in §9.20. The 372 Auth/Locker-only
keys are summarised in §9.19 and otherwise excluded from the census below.

## 9.2 Capture, import and library entry

| Feature the copy implies | Evidence keys |
|---|---|
| Automatic background backup of device photos/videos | `enableAutomaticBackups`, `backedUpAutomatically`, `backupOverMobileData`, `backupVideos`, `backedUpFolders`, `selectFoldersForBackup`, `selectAlbumsToBackUpToEnte`, `backupToEnte` |
| Choose which device folders back up | `backupFolderLabel`, `currentBackupFolder`, `setBackupFolder`, `selectFolders`, `updatingFolderSelection`, `noAlbumsOnThisDevice` |
| "Back up only new photos" cut-off date | `backupOnlyNewPhotos`, `backupOnlyNewPhotosWarningBody`, `backupOnlyNewPhotosAllFoldersSelected`, `backupOnlyNewPhotosNoFoldersSelectedContinue`, `backupOnlyNewPhotosNoFoldersSelectedRequire` |
| Foreground "backup mode" with screen dimming | `backupMode`, `backupModeStart`, `backupModeKeepAppOpen`, `backupModeScreenWillDim`, `backupModeTapToWakeScreen`, `backupModeStayInEnte`, `backupModePlugInPhone`, `backupModePreservingYourMemories`, `backupModeBackingUpItems`, `backupModeCheckingForMoreItems`, `backupModeNoBackupInProgress`, `backupModeFinishYourBackup` |
| Resumable / multipart uploads | `resumableUploads` |
| "Faster uploads" (Cloudflare proxy) | `fasterUploads` |
| Upload progress + per-file states | `uploadedFilesProgress`, `uploadingFilesToAlbum`, `uploadingSingleMemory`, `uploadingMultipleMemories`, `syncProgress`, `queued`, `tapToUpload`, `tapToUploadIsIgnoredDue`, `uploadIsIgnoredDueToIgnorereason`, `skippedFiles`, `resetIgnoredFiles`, `resetIgnoredFilesDescription` |
| Upload failure classes | `uploadError`, `uploadFileTooLargeErrorTitle/Body`, `uploadFileCountLimitErrorTitle/Body/Toast`, `uploadStorageLimitErrorTitle/Body`, `uploadSubscriptionExpiredErrorTitle/Body`, `sorryBackupFailedDesc`, `couldNotBackUpTryLater`, `sorryWeHadToPauseYourBackups`, `backupPausedFreeUpDeviceStorage`, `backupFailed` |
| Add files from the device into an album | `addFromDevice`, `addPhotos`, `addFiles`, `addMore`, `selectItemsToAdd`, `addSelected`, `importFromGallery` |
| Photo-library permission tiers (incl. iOS limited access) | `allowAccessToYourPhotos`, `allowPermTitle`, `allowPermBody`, `grantFullAccessPrompt`, `grantPermission`, `grantPermissionDesc`, `grantGalleryPermissionTitle`, `grantGalleryPermissionDesc`, `pleaseGrantPermissions`, `photoLibraryAddPermissionRequired`, `photoLibraryAddPermissionRestricted`, `albumsOnDevicePermissionCta` |
| First-run loading / sync messaging | `loadingYourPhotos`, `loadingGallery`, `gettingReady`, `readyToBackupTitle`, `readyToBackupSubtitle`, `backingUpLastSevenDaysPhotos`, `almostDone`, `loadMessage1`…`loadMessage9` |
| Local-gallery ("no account") mode | `continueWithoutAccount`, `useOffline`, `localGallery`, `offlineModeWarning`, `offlineHomeSignupBannerTitle/Description/Action`, `offlineSettingsBannerTitle/Desc`, `offlineEnableBackupTagLabel`, `offlineFacesBannerTitle/Subtitle`, `offlineNameFaceBannerTitle/Subtitle`, `appLockOfflineModeWarning` |
| Act as a system photo picker for other apps | `selectFile`, `selectMorePhotos`, `useSelectedPhoto`, `setSelectedPhoto` |
| iCloud-shared-album constraint | `iCloudUnavailable`, `freeUpDeviceSpaceDescICloud` |
| Android "on my iPhone"/scoped-storage constraint | `iosOnMyDeviceNotSupported`, `enableBackupsIosInstruction`, `noDefaultBackupFolder` |

## 9.3 Gallery, layout and browsing

| Feature | Evidence keys |
|---|---|
| Grouped timeline with Day / Week / Month / Year grouping | `groupBy`, `groupByDay`, `groupByWeek`, `groupByMonth`, `groupByYear`, `dayToday`, `dayYesterday`, `thisWeek`, `thisMonth`, `thisYear`, `lastWeek`, `lastMonth` |
| Multiple gallery layouts | `layout`, `albumLayout`, `layoutGrouped`, `layoutJustified`, `layoutJustifiedFlex`, `layoutJustifiedComfort`, `layoutMasonry`, `layoutTrip`, `grid`, `list` |
| Adjustable photo grid density | `photoGridSize`, `compactMode`, `showLargeIcons` |
| Hide shared items from the home timeline | `hideSharedItemsFromHomeGallery` |
| Sorting | `sort`, `sortAlbumsBy`, `sortNewestFirst`, `sortOldestFirst`, `sortAToZ`, `sortZToA`, `mostRecent`, `mostRelevant`, `manualSort`, `customOrder`, `editOrder`, `photoOrder`, `newest`, `recent` |
| Selection UI | `selectAll`, `selectAllShort`, `deselectAll`, `unselectAll`, `clearSelection`, `selected`, `selectedCount`, `selectedPhotos`, `selectedAlbums`, `selectedPhotosWithYours`, `filesSelected` |
| Pseudo-collections | `archiveCollectionName`, `uncategorized`, `hidden`, `trash`, `favorite`, `links` |
| Per-collection empty states | `archivedItemsWillShowUpHere`, `uncategorizedItemsWillShowUpHere`, `hiddenItemsWillShowUpHere`, `activeLinksWillShowUpHere`, `yourTrashIsEmpty`, `trashIsEmpty`, `noFilesFound`, `noPhotosFoundHere`, `startSnappingYourPhotosWillShowUpHere`, `collectionEmptyStateSubtitle`, `startWithAddingPhotosOrFamiliarFaces` |
| Guest view (hand the phone over safely) | `guestView`, `guestViewEnablePreSteps`, `noSystemLockFound` |
| Cast an album to a TV | `castAlbum`, `castSessions`, `castInstruction`, `autoPair`, `pairUsingCode`, `pairWithAutoDesc`, `pairWithCodeDesc`, `connectToDevice`, `deviceNotFound`, `noDeviceFound`, `stopCastingTitle`, `stopCastingBody`, `castIPMismatchTitle/Body`, `autoCastDialogBody`, `autoCastiOSPermission` |
| Album slideshow | `slideshow`, `slideshowSettings`, `timePerPhoto`, `shuffle` |
| Set a photo as wallpaper | `setAs`, `setWallpaper`, `wallpaper`, `wallpaperHome`, `wallpaperLock`, `wallpaperBoth`, `wallpaperSet`, `wallpaperFailed`, `wallpaperUnavailable` |

## 9.4 Photo viewer and media handling

| Feature | Evidence keys |
|---|---|
| Live / motion photos | `livePhotos`, `pressAndHoldToPlayVideoDetailed` |
| Panorama viewer | `panorama` |
| Video playback controls | `playbackSpeed`, `loopVideoOn`, `loopVideoOff`, `muteAudio`, `unmuteAudio`, `playOriginal`, `playStream` |
| Adaptive video streaming (HLS) | `videoStreaming`, `videoStreamingDescriptionLine1/2`, `videoStreamingNote`, `createStream`, `recreateStream`, `creatingStream`, `streamDetails`, `videoPreviewAlreadyExists`, `decryptingVideo`, `failedToDownloadVideo` |
| EXIF inspection | `exif`, `viewAllExifData`, `noExifData`, `thisImageHasNoExifData`, `loadingExifData`, `videoInfo`, `searchResultCameraMake`, `searchResultCameraModel` |
| Photo captions / descriptions | `fileInfoAddDescHint`, `description`, `searchResultDescription` |
| Rename a file | `renameFile`, `enterFileName`, `fileUpdatedSuccessfully`, `failedToUpdateFile` |
| Mark important / unimportant | `important`, `unimportant`, `fileMarkedAsImportant`, `filesMarkedAsImportant`, `markingAsImportant`, `fileRemovedFromImportant`, `removingFromImportant`, `allFilesAlreadyMarkedAsImportant`, `importantNotSupportedForSharedFiles` |
| Save offline / remove offline | `keepOffline`, `cloudOnly`, `savingOffline`, `filesAvailableOffline`, `filesAvailableOfflinePartial`, `filesRemovedFromOffline`, `failedToSaveFilesOffline` |
| Download to device gallery | `download`, `downloading`, `downloadingProgress`, `downloadPhotos`, `fileSavedToGallery`, `filesSavedToGallery`, `downloadFailed`, `downloadDecryptionFailedMessage`, `failedToDownloadOrDecrypt`, `downloadSkippedAlreadyAvailableOnDevice`, `downloadSkippedInSelectionSingleFile`, `downloadSkippedInSelectionMultipleFiles`, `applePhotosUnsupportedResource` |
| OCR — on-device text detection in photos | `ocrNoTextDetected`, `ocrGenericDetectError`, `ocrImageDecodeFailedError`, `ocrImageNotFoundError`, `ocrModelsNetworkRequiredError`, `ocrModelsPrepareFailed` |
| QR code detection in photos | `qr`, `qrCode`, `scanACode`, `scanAQrCode`, `invalidQRCode`, `errorNoQRCode` |
| Filmstrip strip in the viewer | `photoViewerFilmstripLabel`, `photoViewerFilmstripPosition` |
| Unsupported / unopenable files | `couldNotOpenFile`, `errorOpeningFile`, `noAppToOpenFileDownloadInstead`, `unableToExtractFileInformation`, `fileAnalysisFailed`, `imageNotAnalyzed`, `openFile` |

## 9.5 Editing

| Feature | Evidence keys |
|---|---|
| Image editor — crop, rotate, flip | `crop`, `adjustCrop`, `rotate`, `flip`, `align`, `left`, `right` |
| Image editor — tune sliders | `imageEditorBrightness`, `imageEditorContrast`, `imageEditorExposure`, `imageEditorFade`, `imageEditorHue`, `imageEditorLuminance`, `imageEditorSaturation`, `imageEditorSharpness`, `imageEditorTemperature`, `adjust` |
| Image editor — draw / text / stickers | `draw`, `brushColor`, `color`, `font`, `sticker`, `background`, `blurred`, `undo`, `redo` |
| Video editor — trim, crop, rotate, export | `trim`, `crop`, `rotate`, `videoExportSuccess`, `videoExportFailed` |
| Save-copy vs overwrite semantics | `saveCopy`, `editsSaved`, `savingEdits`, `oopsCouldNotSaveEdits`, `discardEditsQuestion`, `doYouWantToDiscardTheEditsYouHaveMade`, `failedToFetchOriginalForEdit`, `editNotSupportedForSharedFiles`, `weDontSupportEditingPhotosAndAlbumsThatYouDont` |
| Collage builder | `createCollage`, `collageLayout`, `saveCollage`, `collageSaved` |
| Bulk date/time editing with relative offsets | `editTime`, `selectDate`, `selectTime`, `selectOneDateAndTime`, `selectOneDateAndTimeForAll`, `moveSelectedPhotosToOneDate`, `shiftDatesAndTime`, `photosKeepRelativeTimeDifference`, `thisWillMakeTheDateAndTimeOfAllSelected`, `newRange`, `selectStartOfRange`, `allWillShiftRangeBasedOnFirst`, `updateTime` |
| Bulk location editing | `editLocation`, `changeLocationOfSelectedItems`, `editsToLocationWillOnlyBeSeenWithinEnte` |

## 9.6 Albums and collections

| Feature | Evidence keys |
|---|---|
| Create / rename / delete albums | `createAlbum`, `newAlbum`, `enterAlbumName`, `albumName`, `albumTitle`, `renameAlbum`, `albumUpdated`, `deleteAlbum`, `deleteAlbumQuestion`, `deleteAlbumDialog`, `deleteMultipleAlbumsQuestion`, `deleteMultipleAlbumDialog`, `pleaseWaitDeletingAlbum` |
| Album description + cover photo | `albumDescriptionHint`, `editDetails`, `selectCoverPhoto`, `setCover`, `useAsCover`, `pickCenterPoint` |
| Bulk-delete empty albums | `deleteEmptyAlbums`, `deleteEmptyAlbumsWithQuestionMark`, `deleteAlbumsDialogBody` |
| Pin / archive / hide albums | `pin`, `unpin`, `pinText`, `unpinText`, `archiveAlbum`, `unarchiveAlbum`, `hide`, `unhide`, `hideContent`, `hideContentDescriptionAndroid`, `hideContentDescriptioniOS` |
| Move / remove / add across albums | `addToAlbum`, `addToHiddenAlbum`, `moveToAlbum`, `moveToHiddenAlbum`, `removeFromAlbum`, `removeFromAlbumTitle`, `unhideToAlbum`, `restoreToAlbum`, `cannotMoveToSharedAlbums`, `cannotMoveToSharedAlbumsMessage`, `itemsWillBeRemovedFromAlbum`, `itemWillBeRemovedFromThisAlbum` |
| Smart albums — auto-add photos of chosen people | `autoAddPeople`, `editAutoAddPeople`, `autoAddToAlbum`, `peopleAutoAddDesc`, `shouldRemoveFilesSmartAlbumsDesc` |
| Quick links → real albums | `convertToAlbum`, `removeLink`, `linkLabel`, `publicLinkEnabled` |
| Album-level "clean uncategorized" | `cleanUncategorized`, `cleanUncategorizedDescription` |
| Album/collection failure copy | `collectionCannotBeDeleted`, `collectionCannotBeEdited`, `collectionCannotBeShared`, `couldNotLoadAlbums`, `failedToLoadAlbums`, `failedToLoadCollections`, `typeOfGallerGallerytypeIsNotSupportedForRename`, `actionNotSupportedOnFavouritesAlbum` |

## 9.7 Sharing and collaboration

| Feature | Evidence keys |
|---|---|
| Share an album with Ente users | `shareAnAlbum`, `shareCollection`, `sharePhotos`, `shareWith`, `enterNameOrEmailToShareWith`, `addPeople`, `addMember`, `sharedWith`, `sharedByYou`, `sharedByOwner`, `sharedAlbumWithYou`, `photosSharedByWillAppearHere` |
| Three participant roles | `viewer`, `collaborator`, `admin`, `viewerRoleDescription`, `collaboratorRoleDescription`, `adminRoleDescription`, `addAsViewers`, `addAsCollaborators`, `addAsAdmins`, `youAreViewer`, `youAreCollaborator`, `youAreAdmin`, `changePermissions`, `chooseAccess`, `yesConvertToViewer`, `cannotAddMoreFilesAfterBecomingViewer` |
| Remove participants / leave albums | `removeParticipant`, `removeAccess`, `removeCollectionParticipantBody`, `leaveAlbum`, `leaveAlbumTitle`, `leaveAlbumBody`, `leaveSharedAlbum`, `leaveCollection`, `leftCollectionsSuccessfully`, `deleteSharedAlbum`, `deleteSharedAlbumDialogBody` |
| Public links with settings | `publicLink`, `createPublicLink`, `shareALink`, `shareLink`, `copyLink`, `sendLink`, `linkSettings`, `manageLink`, `linkExpiry`, `linkExpiresOn`, `linkNeverExpires`, `linkDeviceLimit`, `noDeviceLimit`, `allowDownloads`, `disableDownloadWarningTitle/Body`, `linkEnabled`, `linkExpired`, `linkHasExpired`, `expiredLinkInfo`, `theLinkYouAreTryingToAccessHasExpired`, `linkRequestLimitExceeded`, `removePublicLink`, `removePublicLinks`, `removePublicLinkConfirmation`, `deleteLink`, `deleteLinkQuestion`, `disableLinkMessage`, `deleteShareLinkConfirmation`, `after1Hour`, `after1Day`, `after1Week`, `after1Month`, `after1Year`, `never` |
| Expiry presets for links | `after1Hour`, `after1Day`, `after1Week`, `after1Month`, `after1Year`, `never`, `shareCodesDuration` |
| Collect-photos links (upload without an account) | `collectPhotos`, `createCollaborativeLink`, `collabLinkSectionDescription`, `publicLinkCollectDescription`, `allowAddingPhotos`, `shareWithNonenteUsers`, `publicLinkAccessDescription`, `publicLinkViewDescription`, `shareThisLink` |
| Joining a shared album from a link | `joinAlbum`, `join`, `joinAlbumSubtext`, `joinAlbumSubtextViewer`, `joinAlbumConfirmationDialogBody`, `allowJoining`, `allowJoiningAlbum`, `allowJoiningDescription`, `enableDownloadsToAllowJoining` |
| Embeddable album HTML | `copyEmbedHtml`, `plainHTML`, `plainText` |
| Open a public album in the browser / app | `openAlbumInBrowser`, `openAlbumInBrowserTitle`, `seePublicAlbumLinksInApp`, `allowAppToOpenSharedAlbumLinks`, `canNotOpenTitle`, `canNotOpenBody` |
| Library sharing (share **everything**, incl. future albums) | `librarySharingTitle`, `librarySharingBannerDescription`, `librarySharingEnableTitle/Description`, `librarySharingDisable/Title/Description`, `librarySharingShareAlbums`, `librarySharingShareAlbumCount`, `librarySharingShareWith`, `librarySharingSharingWith`, `librarySharingSharedAlbumCount`, `librarySharingAllCurrentAlbumsShared`, `librarySharingNoAlbumsToShare`, `librarySharingHiddenAlbumsDescription`, `librarySharingRole`, `librarySharingRoles`, `librarySharingUpdateRoles`, `librarySharingStopSharing/Title/Description`, `librarySharingPreviouslyUnsharedTitle/Description`, `librarySharingFailedTitle/Description/AlbumCount`, `librarySharingRetryFailedAlbums`, `librarySharingMemberSubtitle`, `librarySharingMixed` |
| End-to-end verification IDs | `verifyIDLabel`, `thisIsYourVerificationId`, `thisIsPersonVerificationId`, `shareMyVerificationID`, `shareTextConfirmOthersVerificationID`, `someoneSharingAlbumsWithYouShouldSeeTheSameId`, `howToViewShareeVerificationID`, `longPressAnEmailToVerifyEndToEndEncryption` |
| Invite non-users | `invite`, `inviteToEnte`, `sendInvite`, `inviteResent`, `resendInvite`, `invitesSentCount`, `sendCountInvites`, `emailNoEnteAccount`, `emailNoEnteAccountPhotos`, `failedToInvite`, `failedToInviteCount`, `shareTextRecommendUsingEnte`, `shareTextRecommendUsingEnteForPhotos` |
| Suggest deletion in a shared album | `suggestDeletion`, `suggestDeletionDescription`, `deleteSuggestions`, `deleteSuggestionsDesc`, `deleteSuggestionSent`, `rejectSuggestions`, `noDeleteSuggestion`, `youHaveNoFileSuggestedForDeletion` |
| Share a memory as a 7-day link | `shareMemory`, `memoryLink`, `memoryShareLinkDescription`, `deleteMemoryLinkMessage` |
| Share a person's photos | `sharePersonPhotos`, `shareAllPersonPhotos`, `shareAllPersonPhotosDescription`, `personShareFailedTitle/Body`, `personShareRollbackFailed`, `personAlreadyHasAccess` |
| Subscription gates on sharing | `subscribeToEnableSharing`, `subscriptionRequiredForSharing`, `subscribeToChangeLinkSetting` |
| Shared-file action limits | `cannotDeleteSharedFiles`, `deleteNotSupportedForSharedFiles`, `shareNotSupportedForSharedFiles`, `actionNotSupportedForSharedFiles`, `canOnlyRemoveFilesOwnedByYou`, `canOnlyCreateLinkForFilesOwnedByYou`, `removeShareItemsWarning`, `filesAddedByYouWillBeRemovedFromTheCollection`, `photosAddedByYouWillBeRemovedFromTheAlbum` |

## 9.8 Social layer (Feed, likes, comments)

| Feature | Evidence keys |
|---|---|
| A feed of activity on shared albums | `feed`, `feedToEngageWithFamily`, `commentAndReact`, `enableComment` |
| Likes on photos, videos, comments and replies | `like`, `likeAll`, `likesCount`, `likedAPhoto`, `likedAVideo`, `likedAComment`, `likedAReply`, `likedYourPhoto`, `likedYourVideo`, `likedYourComment`, `likedYourReply`, `noLikesYet`, `couldNotLoadLikes`, `failedToUpdateLike`, `failedToLikeComment`, `failedToLikeAlbums`, `selectAlbumToLikePhoto`, `selectAlbumToLikeVideo` |
| Threaded comments with replies | `comments`, `commentsCount`, `commentHint`, `reply`, `replyingTo`, `replyingToYou`, `repliedToAComment`, `repliedToYourComment`, `commentedOnAPhoto`, `commentedOnAVideo`, `commentedOnYourPhoto`, `commentedOnYourVideo`, `deleteComment`, `deleteCommentConfirmation`, `deletedComment`, `failedToDeleteComment` |
| Anonymous / resolved comment authors | `resolvedSocialUserName` (widget), `sharedByOwner`, `and1Other`, `andXOthers` |
| Album activity in the feed | `addedAMemoryTo`, `addedNMemoriesTo`, `sharedAlbumWithYou` |
| Social notifications | `socialNotifications`, `socialNotificationsExplanation` |

## 9.9 Search and discovery

| Feature | Evidence keys |
|---|---|
| On-device search across many axes | `search`, `searchHint`, `searchHint1`…`searchHint5`, `searchAndDiscovery`, `searchAndDiscoveryDesc`, `focusOnSearchBar` |
| Result typing | `searchResultCount`, `searchResultPerson`, `searchResultType`, `searchResultFileName`, `searchResultFileExtension`, `searchResultDescription`, `searchResultUploadedBy`, `searchResultCameraMake`, `searchResultCameraModel` |
| Section-based discovery UI | `searchAlbumsEmptySection`, `searchFileTypesAndNamesEmptySection`, `searchLocationEmptySection`, `searchPeopleEmptySection`, `searchPersonsEmptySection`, `searchDiscoverEmptySection` |
| Search everywhere | `searchEverywhereTitle`, `searchEverywhereSubtitle`, `seeAllCollections` |
| Album name search | `searchAlbums`, `searchByAlbumNameHint` |
| People search | `searchAllPeople` |
| Magic (CLIP) categories — 17 fixed buckets | `discover_babies`, `discover_celebrations`, `discover_food`, `discover_greenery`, `discover_hills`, `discover_identity`, `discover_memes`, `discover_notes`, `discover_pets`, `discover_qr_codes`, `discover_receipts`, `discover_screenshots`, `discover_selfies`, `discover_sunset`, `discover_visiting_cards`, `discover_wallpapers`, `magic` |
| Hierarchical / faceted filtering on results | `filter`, `filters`, `clearAllFilters`, `noItemsMatchSelectedFilters`, `onlyThem`, `related`, `similar`, `closest`, `closeBy` |
| File-type facets | `fileTypes`, `photos`, `videos`, `livePhotos`, `documentsHint`, `documentSearchHint` |
| Empty/no-result states | `noResult`, `noResultsFound`, `noMatchesFound`, `searchEmptyTitle`, `searchEmptyDescription`, `modifyYourQueryOrTrySearchingFor`, `zoomOutToSeePhotos` |
| Search settings | `searchSettings`, `settings` search page |

## 9.10 Machine learning, faces and people

| Feature | Evidence keys |
|---|---|
| Explicit ML consent gate | `mlConsent`, `mlConsentConfirmation`, `mlConsentDescription`, `mlConsentPrivacy`, `machineLearning`, `machineLearningBannerSubtitle`, `mlIndexingDescription` |
| On-device indexing with progress and pause | `localIndexing`, `analyzingPhotosLocally`, `processed`, `clusteringProgress`, `waitingForWifi`, `indexingPausedStatusDescription`, `mlProgressBannerTitle/Description/Status`, `checkingModels`, `loadingModel`, `mlCouldNotProcessItems`, `mlItemsCouldNotBeProcessed`, `mlProcessingIssueReachOut` |
| Face detection and clustering | `people`, `faceNotClusteredYet`, `noFacesFound`, `faceThumbnailGenerationFailed`, `otherDetectedFaces`, `showMoreFaces`, `showLessFaces`, `selectYourFace`, `thisIsMeExclamation` |
| Naming / editing a person | `addPerson`, `addName`, `addANameAndPhoto`, `savePerson`, `editPerson`, `saveAsAnotherPerson`, `removePersonLabel`, `removePersonTag`, `removePersonTitle`, `removePersonBody`, `areYouSureRemoveThisPersonTag`, `areYouSureRemoveThisFaceFromPerson`, `removeFromPersonQuestion`, `selectedItemsWillBeRemovedFromThisPerson` |
| Merge / split / reset clusters | `merge`, `mergeWithExisting`, `mergeWithPersonTitle`, `mergeWithPersonDescription`, `mergedPhotos`, `mixedGrouping`, `doesGroupContainMultiplePeople`, `automaticallyAnalyzeAndSplitGrouping`, `analysis`, `sameperson`, `areThey`, `reset`, `areYouSureYouWantToResetThisPerson`, `allPersonGroupingWillReset`, `yesResetPerson` |
| Suggestion review loop | `reviewSuggestions`, `review`, `smartSuggestions`, `suggestions`, `noSuggestionsForPerson`, `rejectSuggestions` |
| Ignore / show people | `ignore`, `ignorePerson`, `ignored`, `showIgnored`, `showPerson`, `yesIgnore`, `yesShowPerson`, `yesShowPeople`, `thePersonWillNotBeDisplayed`, `thePersonGroupsWillNotBeDisplayed`, `areYouSureYouWantToIgnoreThisPerson`, `areYouSureYouWantToIgnoreThesePersons` |
| Pin people; hide from memories | `pinPerson`, `unpinPerson`, `hideFromMemories`, `showInMemories` |
| Manual file→person tagging | `addToPerson`, `addedFilesToPerson`, `filesAlreadyLinkedToPerson`, `onlyUploadedFilesCanBeAddedToPerson`, `notThisPerson`, `notPersonLabel`, `pleaseNamePersonInPeopleSectionFirst` |
| "Me" designation and reassignment | `me`, `reassignMe`, `reassignedToName`, `reassigningLoading`, `accountOwnerPersonAppbarTitle` |
| Birthdays derived from people | `birthday`, `birthdays`, `enterDateOfBirthHint`, `receiveRemindersOnBirthdays`, `happyBirthday`, `wishThemAHappyBirthday`, `personIsAge`, `personTurningAge` |
| Pet recognition | `pets`, `cat`, `dog` |
| Semantic/magic search backed by CLIP | `magic`, `discover_*`, `searchHint5` ("Coming soon: Faces & magic search ✨") |
| ML debug surface | `algorithm`, `moderateStrength`, `strongPassword` (n/a), ML debug screen strings are hard-coded not localised |

## 9.11 Memories, Memory Lane and Wrapped

| Feature | Evidence keys |
|---|---|
| Memories strip on Home | `memories`, `showMemories`, `curatedMemories`, `smartMemories`, `memoryCount`, `galleryMemoryLimitInfo`, `craftingMemoriesFirstHalf`, `craftingMemoriesSecondHalf`, `lookBackOnYourMemories` |
| "On this day" and year-based memories | `onThisDay`, `onThisDayMemories`, `onThisDayNotificationExplanation`, `pastYearsMemories`, `thisWeekThroughTheYears`, `thisWeekXYearsAgo`, `throughTheYears`, `yearsAgo`, `lastYearsTrip` |
| Trip memories | `tripToLocation`, `tripInYear`, `layoutTrip` |
| People memories with generated captions | `spotlightOnThem`, `spotlightOnYourself`, `youAndThem`, `admiringThem`, `embracingThem`, `feastingWithThem`, `hikingWithThem`, `partyWithThem`, `posingWithThem`, `roadtripWithThem`, `selfiesWithThem`, `sportsWithThem`, `throwbackWithThem`, `backgroundWithThem`, `groupSelfies`, `unnamedPeopleDoingSomethingTogether`, `unnamedPeopleSpotlight`, `unnamedPeopleThrowbackTogether`, `unnamedPeopleYouAndThem`, `unnamedPersonAlbumName` |
| 48 CLIP-driven memory categories | `sunrise`, `mountains`, `greenery`, `beach`, `city`, `moon`, `onTheRoad`, `food`, `pets`, `festivities`, `snowAdventures`, `waterfalls`, `wildlife`, `flowers`, `nightLights`, `architecture`, `autumnColors`, `desertDreams`, `stargazing`, `lakeside`, `rainyDays`, `sportsAction`, `streetArt`, `familyMoments`, `fireworks`, `historicSites`, `tropicalParadise`, `forestTrails`, `citySunsets`, `colorfulMarkets`, `cozyCafes`, `vintageVibes`, `aerialViews`, `artisticPortraits`, `streetFood`, `riverCruises`, `playfulKids`, `coastalCliffs`, `candidLaughter`, `birthdayJoy`, `weddingMoments`, `goldenHourPortraits`, `concertNights`, `poolDays`, `picnicDays`, `campingMoments`, `babySmiles`, `moments` — mapped in `{APP}/models/memories/clip_memory.dart:260` |
| Music behind memories | `{APP}/models/memories/memory_music_track.dart`, `memory_music_session.dart` (no localised strings) |
| Memory Lane / faces timeline | `facesTimelineAppBarTitle`, `facesTimelineBannerTitle`, `facesTimelineUnavailable`, `facesTimelineCaptionYearsAgo`, `facesTimelineCaptionYearsOld`, `facesTimelinePlaybackPlay`, `facesTimelinePlaybackPause`, `memoryLaneCardTitle`, `memoryLaneAgeCaption`, `memoryLaneCaptionToday`, `memoryLaneCaptionDaysAgo`, `memoryLaneCaptionWeeksAgo`, `memoryLaneCaptionMonthsAgo`, `memoryLaneCaptionYearsAgo` |
| Year-in-review ("Wrapped"/Rewind) | `{APP}/ui/wrapped/` — `yourPhotosLookUnique`, `didYouKnow`, `allMemoriesPreserved`, plus card content that is built in code rather than the `.arb` |

## 9.12 Rituals (photo-habit streaks)

| Feature | Evidence keys |
|---|---|
| Create and edit a recurring photo ritual | `ritualsTitle`, `ritualCreateAction`, `ritualCreateNewTitle`, `ritualCreateYourOwn`, `ritualStartNew`, `ritualStartNewDescription`, `ritualEdit`, `ritualUpdate`, `ritualEditorLabel`, `ritualEnterPrompt`, `ritualEnterDescription`, `ritualUntitled` |
| Bind a ritual to an album | `ritualAlbumLabel`, `ritualChooseAlbumLabel`, `ritualSelectAlbumTitle`, `ritualAlbumSelectionPlaceholder`, `ritualAlbumNotSet`, `ritualAlbumMissing`, `ritualSetAlbumToLaunchCamera`, `ritualNoAlbumsYet`, `ritualNoMatchingAlbums`, `ritualAddedToAlbum`, `ritualAddedToAlbumWithName`, `ritualAddToAlbumFailure` |
| Daily reminders on chosen days | `ritualChooseDaysLabel`, `ritualGetDailyReminders`, `ritualSendReminderLabel`, `ritualNotificationMessage`, `ritualNotificationsOffHint` |
| Emoji identity per ritual | `ritualPickEmojiTitle`, `ritualEmojiKeyboardHint`, `ritualEmojiUseAction`, `ritualCustomKeyboardLabel` |
| In-app ritual camera | `ritualDefaultCameraTitle`, `ritualOpenCameraTooltip`, `ritualCaptureError`, `ritualCaptureAtLeastOne`, `ritualCameraNotFound`, `ritualCameraStartError`, `cameraPermissionRequired`, `cameraPermissionRestricted`, `cameraPermissionSettings` |
| Streak sharing + limits | `ritualShareUnavailable`, `ritualPhotoLimit`, `ritualNoPhotosYet`, `ritualBackToList`, `ritualSearchEmpty`, `ritualAddTooltip` |

## 9.13 Maps and locations

| Feature | Evidence keys |
|---|---|
| Photos on a map | `map`, `maps`, `enableMaps`, `yourMap`, `mapsPrivacyNotice`, `hostedAtOsmFrance`, `openstreetmapContributors`, `noImagesWithLocation` |
| Location tags with a radius | `addLocation`, `addLocationButton`, `newLocation`, `locationName`, `locationTagFeatureDescription`, `editLocation`, `deleteLocation`, `centerPoint`, `pickCenterPoint`, `radius`, `setRadius`, `selectALocation`, `selectALocationFirst`, `distanceInKMUnit`, `kiloMeterUnit`, `locationPickerTip`, `noLocation`, `noLocationTag`, `locations`, `location` |

## 9.14 Storage management

| Feature | Evidence keys |
|---|---|
| Free up space hub | `freeUpSpace`, `freeUpAmount`, `reclaimSpace`, `freeUpDeviceSpace`, `freeUpDeviceSpaceDesc`, `freeUpDeviceSpaceConfirmDesc`, `couldNotFreeUpSpace`, `youHaveSuccessfullyFreedUp`, `remindToEmptyDeviceTrash`, `remindToEmptyEnteTrash` |
| Exact-duplicate removal | `removeDuplicates`, `removeDuplicatesDesc`, `deleteDuplicates`, `deduplicateFiles`, `noDuplicates`, `duplicateFileCountWithStorageSaved`, `duplicateItemsGroup`, `youveNoDuplicateFilesThatCanBeCleared` |
| ML near-duplicate ("similar images") | `similarImages`, `similarImagesCount`, `findSimilarImages`, `findingSimilarImages`, `lookingForVisualSimilarities`, `comparingImageDetails`, `noSimilarImagesFound`, `useMLToFindSimilarImages`, `cleanedUpSimilarImages`, `extraPhotosFound`, `keepPhotos`, `deletePhotos`, `deletePhotosWithSize` |
| Large-file review | `viewLargeFiles`, `viewLargeFilesDesc`, `totalSize`, `usedSpace` |
| App cache inspection | `manageDeviceStorage`, `manageDeviceStorageDesc`, `cachedData`, `clearCaches`, `remoteImages`, `remoteThumbnails`, `remoteVideos`, `data`, `itemsStored` |
| Hidden-file cleanup from the device | `cleanupHiddenFiles`, `cleanupHiddenFilesDescription`, `deleteHiddenFilesFromDevice`, `deleteHiddenFilesFromDeviceDescription`, `noHiddenFilesOnDevice`, `cleanupComplete`, `nothingToCleanUp`, `nothingToTidyUpHere` |
| Trash with a 30-day window | `trash`, `emptyTrash`, `emptyTrashQuestion`, `emptyTrashConfirmation`, `permDeleteWarning`, `deletedItemsStayHereForThirtyDays`, `itemsShowTheNumberOfDaysRemainingBeforePermanentDeletion`, `trashDaysLeft`, `restore`, `restoreOrPermanentlyDeleteItems`, `restoredItems`, `restoringFiles`, `trashClearedSuccessfully`, `clearingTrash` |
| Delete scopes | `deleteFromDevice`, `deleteFromEnte`, `deleteFromBoth`, `deleteOnDeviceFiles`, `singleFileDeleteFromDevice`, `singleFileInBothLocalAndRemote`, `singleFileInRemoteOnly`, `selectedFilesBackedUpToEnte`, `selectedFilesSavedOnDeviceOnly`, `someSelectedFilesBackedUpToEnte`, `selectedFilesAreNotOnEnte`, `theseItemsWillBeDeletedFromYourDevice`, `itemsWillBeDeletedFromAllCollections`, `filesCanBeRestoredFromTrash`, `filesInAlbumSafelyOnEnte`, `filesSafelyOnEnte` |
| Android media-management permission shortcut | `mediaManagementHintTitle`, `mediaManagementHintMessage` |

## 9.15 Account, security and recovery

| Feature | Evidence keys |
|---|---|
| Email + OTT sign-up, one account across Ente apps | `createAccount`, `createAnEnteAccount`, `signUp`, `logInLabel`, `singIn`, `weHaveSentCode`, `weHaveSentCodeTo`, `resendCode`, `checkInboxAndSpamFolder`, `yourVerificationCodeHasExpired`, `oneAccountAcrossEnteApps`, `accountSetupIncompleteCreateAccount`, `accountIsAlreadyConfigured` |
| "How did you hear about us" onboarding question | `hearUsWhereTitle`, `hearUsWhereOptionalTitle` |
| Password + strength meter | `setPasswordTitle`, `setAPassword`, `enterNewPasswordToEncrypt`, `enterPasswordToEncrypt`, `confirmPassword`, `passwordsMatch`, `passwordsDontMatch`, `passwordStrength`, `weakStrength`, `moderateStrength`, `strongStrength`, `strongPassword`, `passwordTooShort`, `passwordEmptyError`, `passwordWarning`, `changePassword`, `resetPasswordTitle`, `setNewPassword`, `recreatePasswordTitle`, `recreatePasswordBody` |
| 24-word recovery key | `recoveryKey`, `viewRecoveryKey`, `confirmRecoveryKey`, `confirmYourRecoveryKey`, `enterYourRecoveryKey`, `recoveryKeySaveDescription`, `recoveryKeySaveShortDescription`, `recoveryKeySaved`, `recoveryKeyCopiedToClipboard`, `recoveryKeyVerified`, `recoveryKeyVerifyReason`, `recoveryKeySuccessBody`, `recoveryKeyOnForgotPassword`, `incorrectRecoveryKey`, `invalidRecoveryKey`, `theRecoveryKeyYouEnteredIsIncorrect`, `noRecoveryKeyTitle`, `noRecoveryKeyNoDecryption`, `forgotRecoveryKey`, `saveYourRecoveryKeyIfYouHaventAlready` |
| Two-factor (TOTP) | `twofactor`, `twoFactorAuthTitle`, `twofactorSetup`, `twoFAVerification`, `disableTwofactor`, `confirm2FADisable`, `disablingTwofactorAuthentication`, `twofactorAuthenticationHasBeenDisabled`, `twofactorAuthenticationSuccessfullyReset`, `enterCodeHint`, `scanThisBarcodeWithnyourAuthenticatorApp`, `copypasteThisCodentoYourAuthenticatorApp`, `lostDevice`, `lostDeviceTitle`, `loginWithTOTP` |
| Passkeys | `passkey`, `passkeyAuthTitle`, `passKeyPendingVerification`, `authToViewPasskey` |
| Email verification toggle | `emailVerificationToggle`, `emailVerificationEnableWarning`, `verifyEmail`, `toResetVerifyEmail` |
| App lock (device lock / PIN / password) + auto-lock | `appLock`, `appLockDescription`, `deviceLock`, `pinLock`, `passwordLock`, `enterAppLockPin`, `enterAppLockPassword`, `setNewPin`, `reEnterPin`, `reEnterPassword`, `autoLock`, `autoLockFeatureDescription`, `tapToUnlock`, `lockButtonLabel`, `toEnableAppLockPleaseSetupDevicePasscodeOrScreen`, `deviceLockEnablePreSteps`, `tooManyIncorrectAttempts`, `appLockNotEnabled`, `appLockNotEnabledDescription` |
| Biometric prompts | `androidBiometricHint`, `androidSignInTitle`, `androidCancelButton`, `authenticating`, `authenticationFailedPleaseTryAgain`, `authenticationSuccessful`, plus ~18 `authTo*` reason strings |
| Session management | `activeSessions`, `viewActiveSessions`, `terminate`, `terminateSession`, `signOutOtherDevices`, `signOutFromOtherDevices`, `signOutOtherBody`, `doNotSignOut`, `thisDevice`, `thisWillLogYouOutOfThisDevice`, `thisWillLogYouOutOfTheFollowingDevice`, `sessionExpired`, `loginSessionExpired`, `loginSessionExpiredDetails`, `autoLogoutMessage` |
| Change email | `changeEmail`, `enterNewEmailHint`, `enterYourNewEmailAddress`, `emailChangedTo`, `thisEmailIsAlreadyInUse`, `emailAlreadyRegistered`, `emailNotRegistered` |
| Export data | `exportYourData`, `export`, `selectExportFormat` |
| Delete account | `deleteAccount`, `deleteEnteAccount`, `permanentlyDeleteYourEnteAccount`, `confirmDeleteAccountAcrossApps`, `whyAreYouLeaving`, `reasonForLeaving`, `selectReason`, `deleteReasonBehaviour`, `deleteReasonFoundAnotherService`, `deleteReasonMissingFeature`, `deleteReasonNotListed`, `anythingElse`, `shareYourFeedbackHere` |
| Crash reporting toggle | `crashReporting`, `crashAndErrorReporting`, `thisHelpsUsImproveEnte` |
| Custom server endpoint (self-hosting) | `developerSettings`, `developerSettingsWarning`, `serverEndpoint`, `customEndpoint`, `invalidEndpoint`, `invalidEndpointMessage`, `endpointUpdatedMessage` |
| Insecure-device guard | `insecureDevice`, `sorryWeCouldNotGenerateSecureKeysOnThisDevicennplease` |

## 9.16 Legacy / trusted contacts

| Feature | Evidence keys |
|---|---|
| Nominate trusted contacts who can recover your account | `legacy`, `legacyPageDesc`, `legacyPageDesc2`, `legacyDesc`, `trustedContacts`, `addTrustedContact`, `addTrustedPerson`, `trustedContactsEmptyDescription`, `confirmAddingTrustedContact`, `confirmAddingTrustedContacts`, `trustedContactAccepted`, `trustedContactInvitePending`, `trustedContactStatusAccepted`, `trustedContactStatusPending` |
| Accept / decline / revoke invites | `acceptTrustInvite`, `declineTrustInvite`, `revokeInvite`, `revokeInviteConfirmTitle/Body`, `cancelInvite`, `cancelInviteDesc`, `removeContact`, `removeContactDesc`, `removeYourselfDesc`, `orRemoveYourself`, `youCannotAddYourselfAsLegacyContact`, `legacyAccounts`, `legacyInvite` |
| Time-delayed recovery | `recoveryWaitTime`, `recoveryWaitTimeDescription`, `recoveryWaitTimeChangeWarning`, `chooseARecoveryTime`, `startRecovery`, `startRecoveryDesc`, `recoveryInitiated`, `recoveryInitiatedDesc`, `recoverAccount`, `recoverAccountAfter`, `recoverAccountDesc`, `recoveryReady`, `recoverySuccessful`, `cancelRecovery`, `cancelRecoveryDesc`, `rejectRecovery`, `recoveryWarning`, `recoveryWarningBody`, `recoveryTimeUpdated`, `cannotUpdateRecoveryTime`, `cannotUpdateRecoveryTimeMessage`, `immediate`, `nDays`, `nHours` |
| Legacy kit (3-of-5 paper shares) — **Locker-facing copy** | `legacyKits`, `createLegacyKit`, `createKit`, `createAnotherKit`, `revokeLegacyKit`, `legacyKitMaxReached`, `legacyKitSheet*` family, `legacyIntroCard1/2/3`, `setupLegacy`, `shareYourLegacy` |
| Emergency contact details | `emergencyContact`, `contactName`, `contactNameHint`, `contactDetails`, `contactDetailsHint`, `contactNotes`, `contactNotesHint` |

## 9.17 Plans, billing and growth

| Feature | Evidence keys |
|---|---|
| Subscription plans, monthly/yearly | `subscription`, `subscribe`, `chooseYourPlan`, `viewPlans`, `plansStartAt`, `monthly`, `yearly`, `month`, `freeTrial`, `upgrade`, `renewSubscription`, `renewsOn`, `validTill`, `subWillBeCancelledOn`, `cancelSubscription`, `yesCancel`, `yesRenew`, `confirmPlanChange`, `areYouSureYouWantToChangeYourPlan`, `youCannotDowngradeToThisPlan`, `yourPlanWasSuccessfullyUpgraded`, `yourPlanWasSuccessfullyDowngraded` |
| Three billing rails (Stripe / Play / App Store) | `appstoreSubscription`, `playstoreSubscription`, `googlePlayId`, `appleId`, `managePaymentMethod`, `paymentDetails`, `visitWebToManage`, `contactToManageSubscription`, `cancelOtherSubscription`, `subAlreadyLinkedErrMessage`, `noPaymentAppFound` |
| Payment failure handling | `paymentFailed`, `paymentFailedMessage`, `paymentFailedTalkToProvider`, `failedToVerifyPaymentStatus`, `couldNotUpdateSubscription`, `failedToRefreshStripeSubscription`, `failedToRenew`, `failedToCancel` |
| Storage add-ons | `addOns`, `addOnPageSubtitle`, `viewAddOnButton`, `addOnValidTill` |
| Storage display | `storage`, `usedSpace`, `storageUsedOfTotal`, `usingStorage`, `memberStorageUsed`, `storageLimit`, `storageLimitExceeded`, `storageLimitExplanation`, `currentUsageNote`, `noLimit`, `noLimitSet`, `limit`, `notEnoughStorageTitle/Body`, `usageYou`, `usageFamily`, `storageBreakupYou`, `storageBreakupFamily` |
| Family plans (5 members) | `family`, `familyPlan` copy: `manageFamily`, `addFamilyMember`, `inviteMembers`, `addUpTo5MembersFree`, `shareStorageWith5Members`, `privateSpaceForEveryMember`, `designedForFamilies`, `bringYourFamilyAlong`, `members`, `removeFromFamily`, `removeMemberConfirmTitle/Body`, `leaveFamily`, `leaveFamilyPlan`, `areYouSureThatYouWantToLeaveTheFamily`, `closeFamilyPlan`, `closeFamilyConfirmTitle/Body`, `editStorageLimit`, `yourPlanSupportsFamily`, `inviteLimitReached`, `emailNeedsEnteAccountForFamily`, `onlyFamilyAdminCanChangeCode` |
| Referrals | `referrals`, `yourReferralCode`, `referralCodeHint`, `changeYourReferralCode`, `enterReferralCode`, `enterCodeDescription`, `applyCodeTitle`, `codeAppliedPageTitle`, `referralStep1/2/3`, `referralStats`, `referralStorageInfo`, `referralStorageForBoth`, `storageClaimed`, `claimedByYou`, `usedYourCode`, `earned`, `eligible`, `earnFreeStorage`, `earnMoreSpace`, `free10GB`, `invalidReferralCode`, `unavailableReferralCode`, `codeChangeLimitReached`, `referralsAreCurrentlyPaused`, `failedToApplyCode`, `failedToFetchReferralDetails`, `shareTextReferralInvite` |
| Cross-app promo | `freeStorageOffer`, `freeStorageOfferDescription`, `shareCodeEarnStorage`, `enteAuth`, `enteLocker`, `entePhotos` |

## 9.18 Notifications, widgets, app shell

| Feature | Evidence keys |
|---|---|
| Four notification categories | `notifications`, `sharedPhotoNotifications`, `sharedPhotoNotificationsExplanation`, `socialNotifications`, `socialNotificationsExplanation`, `onThisDayMemories`, `onThisDayNotificationExplanation`, `birthdays`, `receiveRemindersOnBirthdays`, `notifyMe` |
| Three home-screen widget types | `widgets`, `albumsWidgetDesc`, `memoriesWidgetDesc`, `peopleWidgetDesc`, `showTextOnWidget`, `addAlbumWidgetPrompt`, `addMemoriesWidgetPrompt`, `addPeopleWidgetPrompt`, `pastYearsMemories`, `smartMemories` |
| Theme + app icon + language | `theme`, `lightTheme`, `darkTheme`, `systemTheme`, `appearance`, `appIcon`, `chooseIcon`, `black`, `language`, `selectLanguage` |
| In-app update flow | `updateAvailable`, `criticalUpdateAvailable`, `aNewVersionOfEnteIsAvailable`, `downloadApplicationUpdate`, `downloadUpdate`, `checkForUpdates`, `youAreOnTheLatestVersion`, `unableToCheckForUpdatesRightNow`, `clickToInstallOurBestVersionYet`, `whatsNew`, `restartAppToApplyChanges` |
| Help centre + issue reporting | `helpAndSupport`, `askAQuestion`, `requestAFeature`, `suggestFeatures`, `reportAnIssue`, `reportABug`, `raiseTicket`, `contactSupport`, `contactUs`, `getInTouch`, `browseHelpPages`, `viewAllHelpTopics`, `faq`, `faqs`, `backupAndSync`, `backupAndSyncDesc`, `sharingAndCollaboration`, `sharingAndCollaborationDesc`, `storageAndPlans`, `storageAndPlansDesc`, `troubleshooting`, `troubleshootingDesc`, `searchAndDiscovery`, `searchAndDiscoveryDesc`, `subject`, `oneLineAboutTheIssue`, `detailsAboutTheIssue`, `attachLogs`, `attachLogsHelper` |
| Log export / viewing | `logs`, `viewLogs`, `viewLogsAction`, `exportLogs`, `emailYourLogs`, `todaysLogs`, `preparingLogs`, `sendLogsDescription`, `logsDialogBody`, `pleaseSendTheLogsTo`, `logsNotCopiedDownloadNote` |
| No-mail-app fallback | `noEmailAppFound`, `noEmailAppBody`, `selectMailApp`, `continueInMailApp`, `emailUsMessage`, `pleaseEmailUsAt`, `dropSupportEmail` |
| Engagement | `rateUs`, `rateUsOnStore`, `merchandise`, `giveUsAStarOnGithub`, `supportEnte`, `tellUsWhatYouThink`, `shareYourFeedbackHere`, `weAreOpenSource`, `blog`, `privacy`, `privacyPolicyTitle`, `termsOfServicesTitle` |
| Network / generic errors | `noInternetConnection`, `networkConnectionRefusedErr`, `networkHostLookUpErr`, `somethingWentWrong`, `somethingWentWrongMessage`, `somethingWentWrongPleaseTryAgain`, `oops`, `oopsSomethingWentWrong`, `itLooksLikeSomethingWentWrongPleaseRetryAfterSome`, `tempErrorContactSupportIfPersists`, `pleaseContactSupportIfTheProblemPersists`, `pleaseWaitForSometimeBeforeRetrying`, `retry`, `tryAgain`, `letsTryThatAgain` |
| Sync status | `syncing`, `syncStopped`, `pendingSync`, `pendingSyncs`, `pendingSyncsWarningBody`, `localSyncErrorMessage`, `checkStatus`, `status`, `lastUpdated`, `updated`, `currentlyRunning` |
| Seasonal Christmas theming | `{APP}/ui/home/christmas/` (hard-coded, no `.arb` keys) |

## 9.19 Copy that belongs to the other Ente apps (372 keys)

Present in the shared `.arb` but unreachable from `apps/photos` or
`packages/`. Not Photos features; listed so the census is honest about what
the file contains.

- **Ente Auth / TOTP** (~75 keys): `addCode`, `codeIssuerHint`, `digits`,
  `period`, `algorithm`, `nextTotpTitle`, `pinnedCodeMessage`,
  `duplicateCodes`, `deduplicateCodes`, `trashCode`, `showQRAuthMessage`,
  `viewRawCodes`, `rawCodeData`, `notSupportedForHOTP`, plus importers for
  Aegis, 2FAS, andOTP, Bitwarden, Raivo, Lastpass, Proton, Google
  Authenticator (`importAegisGuide`, `import2FasGuide`, …).
- **Ente Locker** (~39 keys): `lockerRecordsCount`, `accountCredentials`,
  `credentialName`, `noteContent`, `physicalRecords`,
  `physicalRecordsDescription`, `scanDocumentTitle`, `saveFileTitle`,
  `informationTypes`, `saveToLocker`, `addPage`, `scanPageOfTotal`,
  `scannerCaptureModeAuto/Manual`, `scannerTorchOn/Off`.
- **Desktop shell** (3 keys): `menubarMode`, `minimizeToTrayOnClose`,
  `minimizeAppOnCopy`, `hintForDesktop`.
- The remainder are generic strings (`advanced`, `addTo`, `checking`,
  `copiedToClipboard`, …) that Photos happens not to use.

## 9.20 Declared but unreferenced anywhere in `mobile/` (20 keys)

These have no call site in `apps/auth`, `apps/locker`, `apps/photos` or
`packages/`. Several describe Photos behaviour that is implemented with
different copy or not at all.

`aNewVersionOfEnteIsAvailable`, `aNewVersionOfEnteLockerIsAvailable`,
`addedToAlbums`, `allowDownloads`, `allowJoiningAlbum`,
`changeYourReferralCode`, `checking`, `downloadUpdate`, `fromYourContacts`,
`layoutJustified`, `longPressAnEmailToVerifyEndToEndEncryption`,
`memoryLaneAgeCaption`, `rateUsOnStore`, `referralCodeHint`, `renameAlbum`,
`secondsCount`, `selectMailApp`,
`typeOfGallerGallerytypeIsNotSupportedForRename`, `videoExportFailed`,
`videoExportSuccess`.

Notable: **`renameAlbum` is dead**. Renaming a normal album happens inside the
Edit-details sheet, labelled `albumName`
(`{APP}/ui/viewer/gallery/hooks/edit_album_details_sheet.dart:161-166`);
the standalone `_renameAlbum` flow labelled `enterAlbumName` is reachable only
for quick links (`{APP}/ui/viewer/gallery/gallery_app_bar_widget.dart:370-380`).
Similarly `allowDownloads` and `allowJoiningAlbum` are dead while
`allowJoining` and `disableDownloadWarningBody` are live — the link-settings
copy has drifted.

---

# 10. ROUGH EDGES

## 10.1 TODO / FIXME / HACK under `{APP}/ui/`

`grep -rn "TODO\|FIXME\|HACK\|XXX:\|h4ck" ui/ --include=*.dart` returns **12**
hits. There are no `FIXME` or `XXX:` markers at all.

| File:line | Marker | Text |
|---|---|---|
| `ui/components/text_input_widget.dart:428` | TODO | "Add clear and custom suffix icons." |
| `ui/social/widgets/file_social_overlay.dart:30` | TODO | "Restore both icons to 24px after updating their ente_icons assets to …" |
| `ui/viewer/actions/file_selection_actions_widget.dart:572` | **h4ck** | links to `flutter/flutter#57920` (comment-893970066) — a Flutter bug workaround inside the multi-select bar |
| `ui/viewer/actions/file_selection_actions_widget.dart:655` | TODO | "Move this entry point to local-gallery mode when the feature is ready." (the offline-link action) |
| `ui/viewer/gallery/gallery_app_bar_widget.dart:442` | TODO | "Remove this duplicate flow when the new design opens the …" |
| `ui/viewer/gallery/component/sectioned_sliver_list.dart:140` | TODO | "Potential improvement: Instead of using same contraints for all children, …" |
| `ui/viewer/gallery/component/group/group_header_widget.dart:110` | TODO | "Make it possible to see the full title if overflowing" (group headers are `TextOverflow.ellipsis` with no alternative) |
| `ui/viewer/gallery/scrollbar/custom_scroll_bar.dart:266` | TODO | "Remove shadow if scrolling perf" |
| `ui/viewer/people/memory_lane_page_v2.dart:555` | TODO | "Replace with an Ente component when it supports this pressed overlay." |
| `ui/viewer/people/memory_lane_page_v2.dart:577` | TODO | same, second occurrence |
| `ui/home/memories/memories_strip.dart:547` | TODO | "Recompute the timeline instead of hiding the card." |
| `ui/home/memories/full_screen_memory.dart:54` | TODO | "Use better naming convention. 'Memory' should be a whole memory and …" |

For context, the rest of `{APP}` (outside `ui/`) carries a further **14**
markers, including two that bear directly on the front end:
`utils/delete_file_util.dart:1085` — *"Replace this component once
ente_components has a ghost button variant"* — and
`services/memory_lane/memory_lane_service.dart:67` — *"this should be removed,
but flagService does not fire MLConsentChangedEvent on remote flags sync"*.

## 10.2 Widgets over 800 lines under `{APP}/ui/`

31 files. The brief already flags `home_widget.dart` and `albums_tab.dart`;
both are here, but neither is the largest.

| Lines | File |
|---|---|
| 2537 | `ui/viewer/file/ocr/text_overlay_widget.dart` |
| 1668 | `ui/home/memories/full_screen_memory.dart` |
| 1660 | `ui/viewer/people/memory_lane_page.dart` |
| 1589 | `ui/wrapped/wrapped_viewer_page.dart` |
| 1584 | `ui/rituals/ritual_page.dart` |
| 1583 | `ui/rituals/ritual_camera_page.dart` |
| 1436 | `ui/viewer/gallery/gallery_app_bar_widget.dart` |
| 1402 | `ui/tabs/home_widget.dart` |
| 1386 | `ui/viewer/actions/file_selection_actions_widget.dart` |
| 1345 | `ui/viewer/gallery/gallery.dart` |
| 1343 | `ui/tools/similar_images_page.dart` |
| 1305 | `ui/rituals/ritual_editor_dialog.dart` |
| 1256 | `ui/wrapped/cards/stats_card_content.dart` |
| 1250 | `ui/tabs/albums_tab.dart` |
| 1157 | `ui/viewer/people/memory_lane_page_v2.dart` |
| 1144 | `ui/viewer/search/result/people_section_all_page.dart` |
| 1140 | `ui/viewer/people/save_or_edit_person.dart` |
| 1120 | `ui/viewer/file/detail_page.dart` |
| 1055 | `ui/settings/debug/ml_debug_settings_page.dart` |
| 1017 | `ui/family/family_plan_page.dart` |
| 974 | `ui/notification/update/change_log_strings.dart` |
| 948 | `ui/viewer/file_details/file_info_faces_item_widget.dart` |
| 943 | `ui/viewer/file/video_widget_native.dart` |
| 913 | `ui/viewer/file/ocr/inline_text_detection.dart` |
| 911 | `ui/social/widgets/comment_bubble_widget.dart` |
| 885 | `ui/social/feed_screen.dart` |
| 871 | `ui/viewer/file/file_app_bar.dart` |
| 871 | `ui/social/comments_screen.dart` |
| 817 | `ui/viewer/people/merge_clusters_to_person_sheet.dart` |
| 803 | `ui/actions/collection/collection_sharing_actions.dart` |
| 801 | `ui/settings/search/settings_search_registry.dart` |

(`change_log_strings.dart` is a data file, not a widget.)

## 10.3 Referenced but unimplemented / provisional

### Untranslated strings shipped to users (`pendingTranslation(...)`)

6 call sites under `{APP}/ui/` — user-visible English hard-coded outside the
`.arb`:

| File:line | String |
|---|---|
| `ui/viewer/actions/file_selection_actions_widget.dart:236` | `"(i) Offline link"` |
| `ui/viewer/search_tab/file_type_section.dart:100` | `"Live"` |
| `ui/viewer/search/search_widget.dart:180` | `"Search photos, people, places..."` — the main search placeholder |
| `ui/sharing/offline_link_selection_sheet.dart:56` | (sheet body) |
| `ui/sharing/offline_link_selection_sheet.dart:78` | `"Create link"` |
| `ui/sharing/offline_link_selection_sheet.dart:111` | `"Share link"` |

### `(i)` internal-only labels that reach the UI string

| File:line | Label |
|---|---|
| `ui/settings/support/help_support_page.dart:73` | `"(i) ${l10n.viewLogs}"` |
| `ui/settings/gallery_settings_screen.dart:53` | `"${l10n.layout} (i)"` |
| `ui/settings/gallery_settings_screen.dart:62` | `"Justified layout tuning (i)"` |
| `ui/settings/justified_layout_tuning_screen.dart:26`, `:36`, `:53` | `"Justified layout tuning (i)"`, `"Flex (i)"`, `"Comfort Large (i)"` |
| `ui/tools/editor/video_editor_page.dart:307` | toast `"(i) Switching to FFmpeg fallback"` |
| `ui/viewer/actions/file_selection_actions_widget.dart:236` | `"(i) Offline link"` |

### Throwing code paths reachable from the UI

`{APP}/ui/viewer/gallery/component/group/type.dart:65` and `:104` both
`throw UnimplementedError`. `GroupType` has 6 members (`day, week, month, size,
year, none`, `:7`) but `getTitle` handles 4 and `getGroupRange` handles 4 —
`GroupType.size` and `GroupType.none` throw. `getLocalizedName` returns the
hard-coded English `"Size"` / `"None"` for those two (`:36-40`).

### Dead code referenced nowhere

- `{APP}/ui/viewer/file/zoomable_live_image_new.dart` — despite the `_new`
  suffix it is the only live-photo viewer and is used
  (`ui/viewer/file/file_widget.dart:64`). No `zoomable_live_image.dart` exists
  beside it, so the suffix is vestigial naming, not a v1/v2 pair.
- 11 dead components in `{APP}/ui/components`, 5 dead classes plus the whole
  `theme/multi_app_demo.dart` in `{PKG}/ui`, and `PrimaryColorTokens` +
  `Shadows` in `{PKG}/ente_components` — full list in §7.
- 20 dead string keys — §9.20.

### Parallel v1/v2 implementations shipping side by side

| Pair | Switch |
|---|---|
| `MemoryLanePage` (1660 lines) vs `MemoryLanePageV2` (1157 lines) | `flagService.internalUser` decides at runtime — `ui/viewer/people/memory_lane_page_v2.dart:41-53` |
| `ButtonWidget` vs `ButtonWidgetV2` vs `ButtonComponent` | no switch; all three are used concurrently (§7.4) |
| `TextInputWidget` vs `TextInputWidgetV2` vs `TextInputComponent` | same |
| `MenuItemWidgetNew` vs `MenuItemWidgetV2` vs `MenuComponent` | same |
| `video_widget_native.dart` vs `video_widget_media_kit.dart` | platform/codec dependent (`video_widget.dart`) |

### Other provisional markers

- `ui/viewer/gallery/gallery_app_bar_widget.dart:442` — a **duplicate flow**
  kept alive pending "the new design".
- `services/wrapped/builders/badge_selector.dart:53` — a card whose subtitle is
  literally `"Full story coming soon."`.
- `strings_en.arb` `searchHint5` = `"Coming soon: Faces & magic search ✨"`,
  although both features ship.
- `{PKG}/feature_flag/lib/src/flag_service.dart:88-91` — `rustMlDb` is
  hard-`false` with a three-stage rollout plan written in the comment.

---

# 11. WEB GALLERY REFERENCE

## 11.0 Where the code actually lives — a scope correction

`{WEB}/packages/gallery` (62 `.ts`/`.tsx` files) contains the **download,
decrypt, cache and viewer data-source** pipeline — but **not the photo grid
itself**. There is no grid component, no virtualization and no scroll handling
in that package: `grep -rl "react-window\|VariableSizeList\|virtualiz"` matches
only `packages/gallery/components/upload-progress/UploadFileList.tsx`, which is
the upload-progress list.

The grid is `{WEB}/apps/photos/src/components/FileList.tsx` (1331 lines), with
its layout maths in
`{WEB}/packages/new/photos/components/utils/thumbnail-grid-layout.ts` and its
placeholders in
`{WEB}/packages/new/photos/components/PlaceholderThumbnails.tsx`. Those three
files are outside the stated scope; they are documented here because the
section asks about virtualization and scroll restore, which exist nowhere else.

## 11.1 Virtualization

**Library:** `react-window`'s `VariableSizeList`
(`FileList.tsx:60`, rendered at `:805-821`).

**Row model.** Files are pre-flattened into a `FileListItem[]` in a
`useEffect` (`:193-300`). Three item types (`:71-90`):

- `"date"` — a date header row, fixed `dateListItemHeight = 48` (`:901`)
- `"file"` — one **row** of thumbnails, height `itemHeight + gap` (`:200`)
- `"span"` — a full-width header/footer/no-files row

Each item carries its own `height`, and `itemSize` just reads it back
(`:733-736`). `listRef.current.resetAfterIndex(0)` is called whenever `items`
changes (`:330-332`) so `VariableSizeList`'s cached offsets are invalidated.

**Grid inside a list.** There is no 2-D virtualizer. Each `"file"` row is a
CSS grid whose `gridTemplateColumns` is built from the item's group spans
(`FileListRow`, `:922-966`); the row component is `memo`ised with
`react-window`'s `areEqual` (`:966`).

**Column maths** (`thumbnail-grid-layout.ts`): `thumbnailMaxWidth =
thumbnailMaxHeight = 180`, `thumbnailGap = 4`,
`thumbnailLayoutMinColumns = 4` (`:1-4`). Columns are
`floor(fittableColumns)` clamped to ≥4 (`:24-28`); tiles then shrink by
`getShrinkRatio` so the row fills the width exactly (`:30-32`). Side gutter is
24 px above 720 px wide, 4 px below (`:51-52`).

**Date coalescing.** Consecutive short date groups are packed onto one row when
they fit, using a `0.244 × columns` allowance for the inter-group gaps
(`FileList.tsx:258-283`). Multi-group rows separate their sub-grids with a
literal `44px` track (`:952`).

**Overscan** is `3` rows (`:812`), and `useIsScrolling` is on (`:813`) —
that flag is what drives the placeholder behaviour in §11.3.

**Deferred rebuilds.** `items` is read through `useDeferredValue` (`:164`) and
the rebuild effect is commented *"Defer resize-heavy list rebuilds so React can
discard stale renders"* (`:194`), so resizing does not block the frame.

## 11.2 Thumbnail load + decrypt

Entry point from a tile:
`downloadManager.renderableThumbnailURL(file, showPlaceholder)`
(`FileList.tsx:1029-1041`), inside a `useEffect` with a `didCancel` guard
(`:1019-1041`).

The pipeline, all in `{WEB}/packages/gallery/services/download-core.ts`:

1. **In-flight dedupe.** `renderableThumbnailURL` (`:125-151`) keeps a
   `Map<fileID, Promise<string|undefined>>` (`thumbnailURLPromises`, `:55-58`),
   so N tiles for one file share one fetch. A rejected promise is deleted so
   the next call retries (`:140-142`); a *successful-but-empty* result (the
   `cachedOnly` miss) is also deleted and re-requested without
   `cachedOnly` (`:146-149`).
2. **Persistent cache first.** `thumbnailData` (`:153-166`) opens the `"thumbs"`
   blob cache (`initThumbnailCacheIfNeeded`, `:70-81`) and returns the cached
   bytes if present. The cache is the **Cache API** on browsers and **OPFS** on
   desktop/Electron (`{WEB}/packages/base/blob-cache.ts:31-35`,
   `openWebCache` `:42`, `openOPFSCacheWeb` `:54`). A cache-open failure is
   swallowed and the manager continues uncached (`:74-79`).
3. **Network fetch.** `downloadThumbnail` (`:168-175`) delegates to the
   transport. For a signed-in Photos user that is
   `photos_downloadThumbnail` (`services/download.ts:131-146`), which hits the
   edge proxy `https://thumbnails.ente.com/?fileID=…` with authenticated
   headers, or falls back to `fetchFile(file.id, "thumbnail")` against the
   configured API origin when a custom origin is set. It is wrapped in
   `retryEnsuringHTTPOk` (`:144`). Public-album and public-memory variants use
   their own credentialed endpoints (`download.ts:96-110`).
4. **Decrypt.** `decryptBlobBytes({ encryptedData, decryptionHeader }, file.key)`
   (`download-core.ts:171-174`). `decryptionHeader` comes off
   `file.thumbnail.decryptionHeader`. `decryptBlobBytes`
   (`{WEB}/packages/base/crypto/index.ts:162-168`) runs libsodium **in a shared
   Web Worker** unless already inside one — so decryption is off the main
   thread.
5. **Cache the plaintext.** The decrypted bytes are written back into the blob
   cache keyed by `file.id.toString()` (`download-core.ts:164`).
6. **Object URL.** `URL.createObjectURL(new Blob([data]))` (`:130-132`). The
   comment at `:124` states these URLs are **cache-owned and must never be
   revoked by callers** — there is no per-tile cleanup, so object URLs live for
   the page's lifetime.

`logout()` clears all four promise maps (`:84-90`).

## 11.3 Placeholder / blur-up during load

**There is no blur-up.** No low-resolution pre-pass, no `filter: blur()`, no
LQIP. `grep -rn "blur" packages/gallery/components/viewer apps/photos/src/components/FileList.tsx`
finds only `backdropFilter: "blur(30px)"` on a modal backdrop
(`packages/gallery/components/viewer/FileViewer.tsx:2080`) and focus-`blur()`
calls.

What exists instead, in `FileList.tsx:1092-1096`:

```tsx
{file.metadata.hasStaticThumbnail ? (
    <StaticThumbnail fileType={file.metadata.fileType} />
) : imageURL ? (
    <img src={imageURL} />
) : (
    <LoadingThumbnail />
)}
```

- `LoadingThumbnail` is a flat `fill.faint` rounded rectangle — six lines, no
  animation, no shimmer
  (`{WEB}/packages/new/photos/components/PlaceholderThumbnails.tsx:8-10`).
- `StaticThumbnail` is a bordered box with a photo or play glyph, used when the
  file's metadata says no real thumbnail exists (`:16-34`).
- The tile is `disabled={!imageURL}` (`FileList.tsx:1077`) and
  `handleClick` refuses to open the viewer until `imageURL` resolves (`:1050`).

**The scroll-aware part.** `FileListRow` receives `isScrolling` from
`react-window` (`:926`) and passes it down as `showPlaceholder`
(`:676`). `showPlaceholder` is forwarded as the `cachedOnly` argument to
`renderableThumbnailURL` (`:1032`), so **while the list is scrolling only
already-cached thumbnails render; uncached tiles stay as the flat placeholder
and only start their network fetch once scrolling stops**. The self-retry at
`download-core.ts:145-150` is what converts that deliberate cache miss into a
real fetch afterwards.

**In the full-screen viewer** there *is* a progressive swap, though still
without blur: `enqueueUpdates`
(`{WEB}/packages/gallery/components/viewer/data-source-core.ts:184-253`) first
resolves the thumbnail URL, measures it, and publishes it as the slide `src`
with `isContentLoading: true` and `isContentZoomable: false` (`:241-247`);
the full-resolution source replaces it in a later `update()`. PhotoSwipe's
own preloader is re-ordered to sit above the content
(`photoswipe-core.ts:866-871`) and its `isContentLoading` filter is driven from
that flag (`:293-295`).

## 11.4 Scroll position restore

**Not implemented.** Concretely:

- `VariableSizeList` is given a `key` that changes with the active collection /
  mode (`FileList.tsx:788-801`, applied at `:807`), and the comment says so
  outright: *"A new key resets virtualization state when the view changes."*
  Remounting throws away `react-window`'s internal scroll offset, so switching
  albums (or into search / people mode) always lands at the top.
- `onScroll` exists (`:753-778`) but does three unrelated things — forwards
  `scrollOffset` to the parent, toggles a back-to-top FAB above 500 px
  (`:756`), and computes the currently-visible date for a sticky header
  (`:758-776`). It never persists the offset.
- The only consumer of the forwarded `onScroll` in the Photos app is
  `CollectionMapDialog.tsx:1426` (`setScrollOffset`), which uses it for a
  cover-header collapse (`:1347-1349`), not restoration.
- `listRef` is used exactly once, for `resetAfterIndex(0)` (`:331`). There is
  **no** `scrollToItem` / `scrollTo` call on the main list; the only
  `scrollToItem` in the app is the collection bar
  (`apps/photos/src/components/gallery/BarImpl.tsx:146`).
- `outerRef.current?.scrollTo({ top: 0 })` is the back-to-top button only
  (`:781-783`).

So: back-navigation from the viewer keeps position **only** because the list is
never unmounted in that case; any change to `activeCollectionID`, `modePlus`
or `activePersonID` resets it.

## 11.5 Summary for a mobile comparison

| Concern | Web (`FileList.tsx` + `packages/gallery`) | Flutter mobile |
|---|---|---|
| Virtualization | `react-window` `VariableSizeList`, 1-D rows, overscan 3 | `CustomScrollView` + `SectionedSliverList` (`{APP}/ui/viewer/gallery/component/sectioned_sliver_list.dart`) |
| Columns | Computed from width, min 4, tiles ≤180 px | User setting `photoGridSize` (§4.0) |
| Thumbnail cache | Cache API (web) / OPFS (desktop), keyed by file id | `ThumbnailInMemoryLruCache` + disk (`{APP}/ui/viewer/file/thumbnail_widget.dart`) |
| Decrypt | libsodium in a shared Web Worker | native/Rust + isolates |
| Placeholder | Flat `fill.faint` box; no blur-up | `ThumbnailPlaceHolder` (`{APP}/ui/viewer/file/file_icons_widget.dart:12`, used at `thumbnail_widget.dart:187`, `:236`); `NoThumbnailWidget` (`{APP}/ui/viewer/file/no_thumbnail_widget.dart:5`) for the no-thumbnail case |
| Defer-while-scrolling | `isScrolling` → `cachedOnly` fetch suppression | `diskLoadDeferDuration` / `serverLoadDeferDuration` passed per tile (`{APP}/ui/viewer/gallery/component/gallery_file_widget.dart:126-128`) |
| Scroll restore | None; `key` remount resets it | No cross-screen restore either, but the gallery does programmatic `jumpTo` for group anchoring (`{APP}/ui/viewer/gallery/gallery.dart:472`) and jump-to-date (`:820-825`) |

---

*End of audit. Inventory only — no recommendations were made.*
