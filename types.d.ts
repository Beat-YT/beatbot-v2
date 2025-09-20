
interface errorResponse {
    "errorCode": string,
    "errorMessage": string,
    "numericErrorCode": number,
    "originatingService": string,
    "messageVars"?: string,
    "intent": string
}

interface Token {
    access_token: string;
    expires_in: number;
    expires_at: string;
    token_type: string;
    /*  refresh_token:      string;
      refresh_expires:    number;
      refresh_expires_at: string;*/
    account_id: string;
    client_id: string;
    internal_client: boolean;
    client_service: string;
    displayName: string;
    app: string;
    in_app_id: string;
    device_id: string;
}

interface VerifyToken {
    token: string;
    session_id: string;
    token_type: string;
    client_id: string;
    internal_client: boolean;
    client_service: string;
    account_id: string;
    expires_in: number;
    expires_at: string;
    auth_method: string;
    display_name: string;
    app: string;
    in_app_id: string;
    device_id: string;
}


interface clientToken {
    access_token: string;
    expires_in: number;
    expires_at: Date;
    token_type: string;
    client_id: string;
    internal_client: boolean;
    client_service: string;
}

interface DeviceCode {
    user_code: string;
    device_code: string;
    verification_uri: string;
    verification_uri_complete: string;
    prompt: string;
    expires_in: number;
    interval: number;
    client_id: string;
}
interface FortniteAPI {
    status: number;
    data: Datum | Datum[];
}

interface Datum {
    id: string;
    name: string;
    description: string;
    type: Type;
    rarity: Rarity;
    series: Series | null;
    set: Set | null;
    introduction: Introduction | null;
    images: Images;
    variants: Variant[] | null;
    searchTags: string[] | null;
    gameplayTags: string[] | null;
    metaTags: string[] | null;
    showcaseVideo: null | string;
    dynamicPakId: null | string;
    displayAssetPath: null | string;
    definitionPath: null | string;
    path: string;
    added: string;
    shopHistory: string[] | null;
    itemPreviewHeroPath?: string;
    customExclusiveCallout?: string;
    exclusiveDescription?: string;
    unlockRequirements?: string;
    builtInEmoteIds?: string[];
}

interface Images {
    smallIcon: null | string;
    icon: null | string;
    featured: null | string;
    other: Other | null;
}

interface Other {
    background?: string;
    coverart?: string;
    decal?: string;
}

interface Introduction {
    chapter: string;
    season: string;
    text: Text;
    backendValue: number;
}

enum Text {
    IntroducedInChapter1Season1 = "Introduced in Chapter 1, Season 1.",
    IntroducedInChapter1Season2 = "Introduced in Chapter 1, Season 2.",
    IntroducedInChapter1Season3 = "Introduced in Chapter 1, Season 3.",
    IntroducedInChapter1Season4 = "Introduced in Chapter 1, Season 4.",
    IntroducedInChapter1Season5 = "Introduced in Chapter 1, Season 5.",
    IntroducedInChapter1Season6 = "Introduced in Chapter 1, Season 6.",
    IntroducedInChapter1Season7 = "Introduced in Chapter 1, Season 7.",
    IntroducedInChapter1Season8 = "Introduced in Chapter 1, Season 8.",
    IntroducedInChapter1Season9 = "Introduced in Chapter 1, Season 9.",
    IntroducedInChapter1SeasonX = "Introduced in Chapter 1, Season X.",
    IntroducedInChapter2Season1 = "Introduced in Chapter 2, Season 1.",
    IntroducedInChapter2Season2 = "Introduced in Chapter 2, Season 2.",
    IntroducedInChapter2Season3 = "Introduced in Chapter 2, Season 3.",
    IntroducedInChapter2Season4 = "Introduced in Chapter 2, Season 4.",
    IntroducedInChapter2Season5 = "Introduced in Chapter 2, Season 5.",
    IntroducedInChapter2Season6 = "Introduced in Chapter 2, Season 6.",
    IntroducedInChapter2Season7 = "Introduced in Chapter 2, Season 7.",
    IntroducedInChapter2Season8 = "Introduced in Chapter 2, Season 8.",
    IntroducedInChapter3Season1 = "Introduced in Chapter 3, Season 1.",
    IntroducedInChapter3Season2 = "Introduced in Chapter 3, Season 2.",
}

interface Rarity {
    value: PurpleValue;
    displayValue: DisplayValueEnum;
    backendValue: RarityBackendValue;
}

enum RarityBackendValue {
    EFortRarityCommon = "EFortRarity::Common",
    EFortRarityEpic = "EFortRarity::Epic",
    EFortRarityLegendary = "EFortRarity::Legendary",
    EFortRarityMythic = "EFortRarity::Mythic",
    EFortRarityRare = "EFortRarity::Rare",
    EFortRarityUncommon = "EFortRarity::Uncommon",
}

enum DisplayValueEnum {
    Common = "Common",
    DarkSeries = "DARK SERIES",
    DcSeries = "DC SERIES",
    Epic = "Epic",
    FrozenSeries = "Frozen Series",
    GamingLegendsSeries = "Gaming Legends Series",
    IconSeries = "Icon Series",
    LavaSeries = "Lava Series",
    Legendary = "Legendary",
    MarvelSeries = "MARVEL SERIES",
    Mythic = "Mythic",
    Rare = "Rare",
    ShadowSeries = "Shadow Series",
    SlurpSeries = "Slurp Series",
    StarWarsSeries = "Star Wars Series",
    Uncommon = "Uncommon",
}

enum PurpleValue {
    Common = "common",
    Dark = "dark",
    Dc = "dc",
    Epic = "epic",
    Frozen = "frozen",
    Gaminglegends = "gaminglegends",
    Icon = "icon",
    Lava = "lava",
    Legendary = "legendary",
    Marvel = "marvel",
    Mythic = "mythic",
    Rare = "rare",
    Shadow = "shadow",
    Slurp = "slurp",
    Starwars = "starwars",
    Uncommon = "uncommon",
}

interface Series {
    value: DisplayValueEnum;
    image: null | string;
    backendValue: SeriesBackendValue;
}

enum SeriesBackendValue {
    CUBESeries = "CUBESeries",
    ColumbusSeries = "ColumbusSeries",
    CreatorCollabSeries = "CreatorCollabSeries",
    DCUSeries = "DCUSeries",
    FrozenSeries = "FrozenSeries",
    LavaSeries = "LavaSeries",
    MarvelSeries = "MarvelSeries",
    PlatformSeries = "PlatformSeries",
    ShadowSeries = "ShadowSeries",
    SlurpSeries = "SlurpSeries",
}

interface Set {
    value: null | string;
    text: null | string;
    backendValue: string;
}

interface Type {
    value: TypeValue;
    displayValue: DisplayValue;
    backendValue: TypeBackendValue;
}

enum TypeBackendValue {
    AthenaBackpack = "AthenaBackpack",
    AthenaCharacter = "AthenaCharacter",
    AthenaDance = "AthenaDance",
    AthenaEmoji = "AthenaEmoji",
    AthenaGlider = "AthenaGlider",
    AthenaItemWrap = "AthenaItemWrap",
    AthenaLoadingScreen = "AthenaLoadingScreen",
    AthenaMusicPack = "AthenaMusicPack",
    AthenaPet = "AthenaPet",
    AthenaPetCarrier = "AthenaPetCarrier",
    AthenaPickaxe = "AthenaPickaxe",
    AthenaSkyDiveContrail = "AthenaSkyDiveContrail",
    AthenaSpray = "AthenaSpray",
    AthenaToy = "AthenaToy",
    BannerToken = "BannerToken",
}

enum DisplayValue {
    AIIronManEmote = "AI Iron Man Emote",
    BackBling = "Back Bling",
    Banner = "Banner",
    BuiltInEmote = "Built-In Emote",
    Contrail = "Contrail",
    DisplayValueBuiltInEmote = "Built-in Emote",
    DisplayValuePet = "Pet",
    Emote = "Emote",
    Emoticon = "Emoticon",
    Glider = "Glider",
    HarvestingTool = "Harvesting Tool",
    LoadingScreen = "Loading Screen",
    Music = "Music",
    MusicPack = "Music Pack",
    NoBackBling = "No Back Bling",
    Null = "null",
    Outfit = "Outfit",
    Pet = "PET",
    Social = "Social",
    Spray = "Spray",
    TestSpray = "Test Spray",
    Toy = "Toy",
    Wrap = "Wrap",
}

type TypeValue =
    "backpack" |
    "banner" |
    "contrail" |
    "emoji" |
    "emote" |
    "glider" |
    "loadingscreen" |
    "music" |
    "outfit" |
    "pet" |
    "petcarrier" |
    "pickaxe" |
    "spray" |
    "toy" |
    "wrap"


interface Variant {
    channel: Channel;
    type: null | string;
    options: Option[];
}

enum Channel {
    ClothingColor = "ClothingColor",
    Emissive = "Emissive",
    Hair = "Hair",
    JerseyColor = "JerseyColor",
    Material = "Material",
    Mesh = "Mesh",
    Numeric = "Numeric",
    Particle = "Particle",
    Parts = "Parts",
    Pattern = "Pattern",
    PetTemperament = "PetTemperament",
    ProfileBanner = "ProfileBanner",
    Progressive = "Progressive",
}

interface Option {
    tag: string;
    name: null | string;
    image: string;
    unlockRequirements?: string;
}


interface FriendSummary {
    friends: Friend[];
    incoming: Incoming[];
    outgoing: any[];
    suggested: any[];
    blocklist: Blocklist[];
    settings: Settings;
    limitsReached: LimitsReached;
}

interface Blocklist {
    accountId: string;
}

interface Friend {
    accountId: string;
    groups: any[];
    mutual: number;
    alias: string;
    note: string;
    favorite: boolean;
    created: string;
}

interface Incoming {
    accountId: string;
    mutual: number;
    favorite: boolean;
    created: string;
}

interface LimitsReached {
    incoming: boolean;
    outgoing: boolean;
    accepted: boolean;
}

interface Settings {
    acceptInvites: string;
    mutualPrivacy: string;
}


interface FriendIncoming {
    accountId: string;
    groups: any[];
    mutual: number;
    alias: string;
    note: string;
    favorite: boolean;
    created: string;
}


interface settings {
    AthenaCosmeticLoadout: {
        backpackDef: string,
        characterPrimaryAssetId: string,
        characterDef: string,
        pickaxeDef: string,
        contrailDef: string,
        contrailEKey: string,
        pickaxeEKey: string,
        backpackEKey: string,
        characterEKey: string,
        scratchpad: []
        cosmeticStats: []
    },
    acceptIncoming: boolean
    skin: string,
    pickaxe: string,
    backpackDef: string,
    skinVariants: Record<string, string>
    platform: 'WIN' | 'MAC' | 'PSN' | 'XBL' | 'SWT' | 'IOS' | 'AND'
    bannerIcon: string
    level: number
}

interface Account {
    id: string;
    displayName: string;
    externalAuths: any;
}


interface XmppPing {
    sent: string;
    type: string;
    ns: string;
    pinger_id: string;
    pinger_dn: string;
    expires: string;
    meta: Record<string, string>;
}

interface MemberJoined {
    sent: string;
    type: string;
    connection: Connection;
    revision: number;
    ns: string;
    party_id: string;
    account_id: string;
    account_dn: string;
    member_state_updated: Record<string, string>;
    joined_at: string;
    updated_at: string;
}

interface MemberKicked {
    sent:                 string;
    type:                 string;
    revision:             number;
    ns:                   string;
    party_id:             string;
    account_id:           string;
    member_state_updated: Record<string, string>;
}

interface Connection {
    id: string;
    meta: Record<string, string>;
    connected_at: string;
    updated_at: string;
    yield_leadership: boolean;
}

interface Party {
    id:         string;
    created_at: string;
    updated_at: string;
    config:     Config;
    members:    Member[];
    applicants: any[];
    meta:       PartyMeta;
    invites:    any[];
    revision:   number;
    intentions: any[];
}

interface Config {
    type:              string;
    joinability:       string;
    discoverability:   string;
    sub_type:          string;
    max_size:          number;
    invite_ttl:        number;
    join_confirmation: boolean;
    intention_ttl:     number;
}

interface Member {
    account_id:  string;
    meta:        MemberMeta;
    connections: Connection[];
    revision:    number;
    updated_at:  string;
    joined_at:   string;
    role:        string;
}

interface Connection {
    id:               string;
    connected_at:     string;
    updated_at:       string;
    yield_leadership: boolean;
    meta:             ConnectionMeta;
}

interface ConnectionMeta {
    "urn:epic:conn:platform_s": string;
    "urn:epic:conn:type_s":     string;
}

interface MemberMeta {
    "urn:epic:member:joinrequestusers_j"?:      string;
    "urn:epic:member:dn_s":                     string;
    "Default:FrontEndMapMarker_j"?:             string;
    "Default:ArbitraryCustomDataStore_j"?:      string;
    "Default:NumAthenaPlayersLeft_U"?:          string;
    "Default:AthenaCosmeticLoadout_j"?:         string;
    "Default:CampaignInfo_j"?:                  string;
    "Default:BattlePassInfo_j"?:                string;
    "Default:FeatDefinition_s"?:                string;
    "Default:CampaignHero_j"?:                  string;
    "Default:SpectateAPartyMemberAvailable_b"?: string;
    "Default:FrontendEmote_j"?:                 string;
    "Default:HasPurchasedSTW_b"?:               string;
    "Default:AthenaCosmeticLoadoutVariants_j"?: string;
    "Default:MemberSquadAssignmentRequest_j"?:  string;
    "Default:CrossplayPreference_s"?:           string;
    "Default:AthenaBannerInfo_j"?:              string;
    "Default:PlatformData_j"?:                  string;
    "Default:GameMode_s"?:                      string;
    "Default:SubGame_s"?:                       string;
    "internal:voicechatmuted_b"?:               string;
    "Default:AssistedChallengeInfo_j"?:         string;
    "Default:Location_s"?:                      string;
    "Default:HasCompletedSTWTutorial_b"?:       string;
    "Default:VoiceChatStatus_s"?:               string;
    "Default:SharedQuests_j"?:                  string;
    "Default:PlatformSupportsSTW_b"?:           string;
    "Default:UtcTimeStartedMatchAthena_s"?:     string;
    "Default:LobbyState_j"?:                    string;
}

interface PartyMeta {
    "Default:TheaterId_s":                         string;
    "Default:AllowJoinInProgress_b":               string;
    "Default:PartyIsJoinedInProgress_b":           string;
    "Default:TileStates_j":                        string;
    "Default:RawSquadAssignments_j":               string;
    "Default:PartyState_s":                        string;
    "Default:PlaylistData_j":                      string;
    "Default:MatchmakingState_s":                  string;
    "urn:epic:cfg:party-type-id_s":                string;
    "urn:epic:cfg:build-id_s":                     string;
    "urn:epic:cfg:presence-perm_s":                string;
    "Default:CustomMatchKey_s":                    string;
    "urn:epic:cfg:accepting-members_b":            string;
    "Default:LFGTime_s":                           string;
    "urn:epic:cfg:join-request-action_s":          string;
    "Default:PrimaryGameSessionId_s":              string;
    "Default:AthenaPrivateMatch_b":                string;
    "urn:epic:cfg:invite-perm_s":                  string;
    "Default:PrivacySettings_j":                   string;
    "Default:CreativeDiscoverySurfaceRevisions_j": string;
    "Default:ZoneTileIndex_U":                     string;
    "Default:GameSessionKey_s":                    string;
    "Default:MatchmakingResult_s":                 string;
    "urn:epic:cfg:chat-enabled_b":                 string;
    "Default:AthenaSquadFill_b":                   string;
    "Default:ZoneInstanceId_s":                    string;
    "Default:PartyMatchmakingInfo_j":              string;
    "Default:PlatformSessions_j":                  string;
    "urn:epic:cfg:can-join_b":                     string;
    "Default:ActivityName_s":                      string;
    "Default:CurrentRegionId_s":                   string;
    "Default:LobbyConnectionStarted_b":            string;
    "Default:SessionIsCriticalMission_b":          string;
}


interface UserParty {
    current: Party[];
    pending: any[];
    invites: any[];
    pings:   Ping[];
}




interface ApiBanner {
    id:              string;
    devName:         string;
    name:            BannerName;
    description:     null | string;
    category:        BannerCategory;
    fullUsageRights: boolean;
    images:          BannerImages;
}

enum BannerCategory {
    BattleRoyale = "BattleRoyale",
    Founder = "Founder",
    Other = "Other",
    Special = "Special",
    Standard = "Standard",
}

interface BannerImages {
    smallIcon: string;
    icon:      string;
}

enum BannerName {
    BannerIcon = "Banner Icon",
    HomebaseBanner = "Homebase Banner",
    MechaTeamBanner = "Mecha Team Banner",
    MonsterTeamBanner = "Monster Team Banner",
    WorldCup2019Banner = "World Cup 2019 Banner",
}

namespace Mcp {
    export interface Ticket {
        serviceUrl: string,
        ticketType: string,
        payload: string,
        signature: string
    }
}