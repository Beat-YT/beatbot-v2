/// <reference path="../../../types.d.ts"/>
/// <reference path="../session-manager.js"/>

;
(
    async function () {
        const accountService = await getUserSession();

        if (!accountService) { 
            return location.replace('/login');
        }

        document.getElementById('logoutButton').onclick = async function () {
            await accountService.killSession();
            localStorage.removeItem('account_session_j')
            document.location.replace('/')
        }


        document.getElementById('loggedAs').innerText += accountService.session.displayName
        document.getElementById('copyUsername').onclick = function () {
            copyTextToClipboard(accountService.session.displayName);
        }
        const loadingRing = document.getElementById('loadingRing');
        const main = document.getElementById('main');

        const s_settings = localStorage.getItem('settings');

        /**
         * @type {settings}
         */
        const settings = s_settings ? JSON.parse(
            s_settings
        ) : {
            status: null,
            AthenaCosmeticLoadout: {
                backpackDef: null,
                characterPrimaryAssetId: 'AthenaCharacter:CID_001_Athena_Commando_F_Default',
                characterDef: '/Game/Athena/Items/Cosmetics/Characters/CID_001_Athena_Commando_F_Default.CID_001_Athena_Commando_F_Default',
                pickaxeDef: `/Game/Athena/Items/Cosmetics/Pickaxes/DefaultPickaxe.DefaultPickaxe`,
                contrailDef: `/Game/Athena/Items/Cosmetics/Contrails/DefaultContrail.DefaultContrail`,
                contrailEKey: "",
                pickaxeEKey: "",
                backpackEKey: "",
                characterEKey: "",
                scratchpad: []
            },
            acceptIncoming: true,
            skin: 'CID_001_Athena_Commando_F_Default',
            pickaxe: 'DefaultPickaxe',
            backpackDef: null,
            platform: null,
            skinVariants: {},
            bannerIcon: '',
            level: 1
        };

        if (settings.platform == null) {
            console.log('platform not set')
            settings.platform = await getDefaultPlatform();
            console.log('platform set to', settings.platform)
        }

        if (!settings.AthenaCosmeticLoadout) {
            settings.AthenaCosmeticLoadout = {
                backpackDef: settings.backpackDef,
                characterPrimaryAssetId: 'AthenaCharacter:CID_001_Athena_Commando_F_Default',
                characterDef: '/Game/Athena/Items/Cosmetics/Characters/CID_001_Athena_Commando_F_Default.CID_001_Athena_Commando_F_Default',
                pickaxeDef: `/Game/Athena/Items/Cosmetics/Pickaxes/DefaultPickaxe.DefaultPickaxe`,
                contrailDef: `/Game/Athena/Items/Cosmetics/Contrails/DefaultContrail.DefaultContrail`,
                contrailEKey: "",
                pickaxeEKey: "",
                backpackEKey: "",
                characterEKey: "",
                scratchpad: []
            };
        }

        const client = new Client(accountService.session, settings.platform);
        const friendsService = new FriendsService(accountService.session);
        const partyService = new PartyService(accountService.session);

        /**
         * @type {string}
         */
        var partyId;

        client.addEventListener('ready', async () => {
            loadingRing.style.display = 'none';
            main.style.display = 'block';

            const playerParty = await partyService.queryUser();

            if (playerParty.current[0]) {
                await partyService.joinParty(playerParty.current[0].id, client.xmpp.jid.toString(), settings.platform);
                partyService.party = playerParty.current[0];
            }
        })

        client.addEventListener(
            'com.epicgames.social.party.notification.v0.MEMBER_STATE_UPDATED',
            async ({ detail: data }) => {
                if (data.party_id != partyService.party.id) return;

                const memeber = partyService.party.members.find(x => x.account_id == data.account_id);
                memeber.meta = {
                    ...memeber.meta,
                    ...data.member_state_updated,
                    ...data.member_state_overridden
                }

                const captain = partyService.party.members.find(x => x.role == 'CAPTAIN').account_id;
                if ('Default:LobbyState_j' in data.member_state_updated && data.account_id != accountService.session.account_id && captain == data.account_id) {
                    await partyService.updateMemberMeta(
                        {
                            'Default:LobbyState_j': data.member_state_updated['Default:LobbyState_j']
                        }
                    )
                }
            }
        )

        client.addEventListener(
            'com.epicgames.social.party.notification.v0.PARTY_UPDATED',
            async ({ detail: data }) => {
                partyService.party.members = partyService.party.members.map(x => {
                    if (data.captain_id == x.account_id) {
                        x.role = 'CAPTAIN';
                    } else {
                        x.role = 'MEMBER';
                    }

                    return x;
                })

                partyService.party.meta = {
                    ...partyService.party.meta,
                    ...data.party_state_updated,
                    ...data.party_state_overridden
                }

                if ('Default:PartyMatchmakingInfo_j' in data.party_state_updated) {
                    // "{"PartyMatchmakingInfo":{"buildId":-1,"hotfixVersion":-1,"regionId":"","playlistName":"None","playlistRevision":0,"tournamentId":"","eventWindowId":"","linkCode":""}}"
                    const partyMatchMakingInfo = JSON.parse(data.party_state_updated['Default:PartyMatchmakingInfo_j']).PartyMatchmakingInfo;
                    if (partyMatchMakingInfo.buildId === -1) return;

                    const partyPlayersId = partyService.party.members.map(x => x.account_id);
                    var ticket = await new McpService(accountService.session).getTicket(partyPlayersId, partyService.party.id, partyMatchMakingInfo);
                    // decode base64 ticket and parse it as json
                    try {
                        const payload = JSON.parse(atob(ticket.payload));
                        if (!payload.bucketId.includes('bots')) {
                            Swal.fire(
                                {
                                    title: "Not going to a bot lobby",
                                    text: `The account ${accountService.session.displayName} is too leveled to go to a bot lobby, create a new account and try again.`,
                                    icon: 'warning'
                                }
                            )
                        }
                    } catch {
                        
                    }


                    const matchmaking = new MatchmakingClient(ticket);
                    matchmaking.connect();
                }
            }
        )

        client.addEventListener(
            'com.epicgames.social.party.notification.v0.MEMBER_NEW_CAPTAIN',
            async ({ detail: data }) => {
                if (data.account_id == accountService.session.account_id) {
                    // promote old captain back because we are not a real player
                    let captainId = partyService.party.members.find(x => x.role == 'CAPTAIN').account_id;
                    if (captainId == accountService.session.account_id) {
                        captainId = partyService.party.members.find(
                            x => x.role == 'MEMBER' && x.account_id != accountService.session.account_id
                        ).account_id;
                    }
                    captainId && await partyService.promote(captainId);
                }

                partyService.party.members = partyService.party.members.map(x => {
                    if (data.account_id == x.account_id) {
                        x.role = 'CAPTAIN';
                    } else {
                        x.role = 'MEMBER';
                    }

                    return x;
                })
            }
        )

        client.addEventListener('com.epicgames.social.party.notification.v0.MEMBER_KICKED',
            /**
             * 
             * @param {{detail: MemberKicked}}} param0 
             */
            async ({ detail: data }) => {
                if (data.ns != "Fortnite") {
                    return;
                }

                partyService.party.members = partyService.party.members.filter(x => x.account_id != data.account_id);
                if (data.account_id == accountService.session.account_id) {
                    partyService.party = null;
                }
            }
        )

        client.addEventListener('com.epicgames.social.party.notification.v0.MEMBER_JOINED',
            /**
             * 
             * @param {{detail: MemberJoined}}} param0 
             */
            async ({ detail: data }) => {
                if (data.ns != "Fortnite") {
                    return;
                }

                if (data.account_id == accountService.session.account_id) {
                    const partyInfos = await partyService.queryParty(data.party_id);
                    partyService.party = partyInfos;
                    const heroId = settings.skin.replace('CID_', 'HID_');
                    partyService.updateMemberMeta(
                        {
                            ...DEFAULT_PARTY_META,
                            "Default:CampaignHero_j": {
                                CampaignHero: {
                                    heroItemInstanceId: "",
                                    heroType: `/Game/Athena/Heroes/${heroId}.${heroId}`
                                }
                            },
                            "Default:FrontendEmote_j": {
                                FrontendEmote: {
                                    emoteItemDef: "None",
                                    emoteEKey: "",
                                    emoteSection: -1
                                }
                            },
                            "Default:AssistedChallengeInfo_j": {
                                AssistedChallengeInfo: {
                                    questItemDef: "None",
                                    objectivesCompleted: 0
                                }
                            },
                            "Default:MemberSquadAssignmentRequest_j": {
                                MemberSquadAssignmentRequest: {
                                    startingAbsoluteIdx: -1,
                                    targetAbsoluteIdx: -1,
                                    swapTargetMemberId: "INVALID",
                                    version: 0
                                }
                            },
                            "Default:FrontEndMapMarker_j": {
                                FrontEndMapMarker: {
                                    markerLocation: {
                                        x: -26334.0703125,
                                        y: 31539.703125
                                    },
                                    bIsSet: false
                                }
                            },
                            "Default:AthenaCosmeticLoadout_j": {
                                AthenaCosmeticLoadout: settings.AthenaCosmeticLoadout
                            },
                            "Default:AthenaCosmeticLoadoutVariants_j": {
                                AthenaCosmeticLoadoutVariants: {
                                    vL: {
                                        AthenaCharacter: {
                                            i: mapVariants(settings.skinVariants)
                                        }
                                    }
                                }
                            },
                            "Default:ArbitraryCustomDataStore_j": {
                                ArbitraryCustomDataStore: []
                            },
                            "Default:AthenaBannerInfo_j": {
                                AthenaBannerInfo: {
                                    bannerIconId: settings.bannerIcon,
                                    bannerColorId: "",
                                    seasonLevel: settings.level
                                }
                            },
                            "Default:BattlePassInfo_j": {
                                BattlePassInfo: {
                                    bHasPurchasedPass: false,
                                    passLevel: 1,
                                    selfBoostXp: 0,
                                    friendBoostXp: 0
                                }
                            },
                            "Default:Platform_j": {
                                Platform: {
                                    platformDescription: {
                                        name: settings.platform,
                                        platformType: "DESKTOP",
                                        onlineSubsystem: "None",
                                        sessionType: "",
                                        externalAccountType: "",
                                        crossplayPool: "DESKTOP"
                                    }
                                }
                            }
                        }
                    )
                }
            }
        )

        client.addEventListener('com.epicgames.social.party.notification.v0.MEMBER_LEFT',
            async ({ detail: data }) => {
                if (data.ns != "Fortnite" || data.party_id != partyService.party.id) {
                    return;
                }

                partyService.party.members = partyService.party.members.filter(x => x.account_id != data.account_id);
                if (data.account_id == accountService.session.account_id) {
                    partyService.party = null;
                }
            }
        )

        client.addEventListener('FRIENDSHIP_REQUEST', async (event) => {
            const data = event.detail;
            console.log("FRIENDSHIP_REQUEST", event.detail, settings.acceptIncoming)
            /*{
                "type": "FRIENDSHIP_REQUEST",
                "timestamp": "2022-04-26T22:42:47.490Z",
                "from": "edecf7a882494f5e9ca9c6b61d9181cf",
                "to": "bff0779922d14863942d867cf3c39af1",
                "status": "PENDING"
            }*/

            if (data.status == "PENDING" && settings.acceptIncoming) {
                const sender = await accountService.getById(data.from);
                await friendsService.sendInviteOrAcceptInvite(data.from);

                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 9000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    },
                    icon: 'info',
                    title: `Accepted a friend request from ${sender.displayName}`
                })
            }
        })

        // party invite
        client.addEventListener('com.epicgames.social.party.notification.v0.PING',
            /**
             * 
             * @param {{detail: XmppPing}}} param0 
             */
            async ({ detail: data }) => {
                if (data.ns != "Fortnite") {
                    return;
                }

                if (partyService.party) {
                    await partyService.leaveParty();
                }

                await partyService.joinPartyFromPing(data.pinger_id, client.xmpp.jid.toString(), settings.platform);
            }
        )

        if (settings.acceptIncoming) {
            friendsService.queryIncomingFriendRequests().then(
                incommings => {
                    incommings.forEach(
                        incomming => friendsService.sendInviteOrAcceptInvite(incomming.accountId)
                    )
                }
            );
        }

        fetchAPI('https://fortnite-api.com/v2/cosmetics/br/search/all?type=emote')
            .then(data => {
                const emoteList = document.createElement('datalist');
                emoteList.id = 'emote_list';

                data.forEach(
                    emote => {
                        const ele = document.createElement('option');
                        ele.setAttribute('value', emote.name);
                        emoteList.appendChild(ele);
                    }
                );

                document.body.appendChild(emoteList);
            });

        var outfits = fetchAPI('https://fortnite-api.com/v2/cosmetics/br/search/all?type=outfit')
            .then(data => {
                const emoteList = document.createElement('datalist');
                emoteList.id = 'outfit_list';

                data.forEach(
                    emote => {
                        const ele = document.createElement('option');
                        ele.setAttribute('value', emote.name);
                        emoteList.appendChild(ele);
                    }
                );

                document.body.appendChild(emoteList);

                return data;
            });

        document.getElementById('emoteBtn').onclick = function () {
            if (!partyService.party) {
                return Swal.fire(
                    {
                        title: "Can't do that",
                        text: 'The bot is not in a party!',
                        icon: 'error'
                    }
                )
            }
            Swal.fire(
                {
                    title: 'Set emote',
                    input: 'text',

                    inputAttributes: {
                        autocapitalize: 'off',
                        autocomplete: 'on',
                        placeholder: "Floss",
                        list: 'emote_list'
                    },
                    showDenyButton: true,
                    denyButtonText: 'stop emoting',
                    showCancelButton: true,
                    confirmButtonText: 'Set',
                    showLoaderOnConfirm: true,
                    /**
                     * 
                     * @param {string} value 
                     * @returns 
                     */
                    preConfirm: async (value) => {
                        const searchParams = new URLSearchParams(
                            {
                                type: 'emote'
                            }
                        )

                        if (value.toLowerCase().startsWith('eid_')) {
                            searchParams.set('id', value);
                        } else {
                            searchParams.set('name', value);
                        }

                        try {
                            /**
                             * @type {Datum}
                             */
                            const emote = await fetchAPI(
                                `https://fortnite-api.com/v2/cosmetics/br/search?${searchParams}`
                            )

                            return emote;
                        } catch {
                            Swal.showValidationMessage(
                                `Emote not found`
                            )
                        }
                    },
                    allowOutsideClick: () => !Swal.isLoading()
                }
            ).then((result) => {
                if (result.isConfirmed) {

                    const emoteId = typeof result.value == 'string' ? result.value : result.value.id
                    const emotePath = result.value.path.replace('FortniteGame/Content', '/Game').replace('FortniteGame/Plugins/GameFeatures/BRCosmetics/Content', '/BRCosmetics') + `.${emoteId}`;

                    partyService.updateMemberMeta(
                        {
                            "Default:FrontendEmote_j": {
                                FrontendEmote: {
                                    emoteItemDef: emotePath,
                                    emoteEKey: "",
                                    emoteSection: -1
                                }
                            },
                        }
                    )
                } else if (result.isDenied) {
                    partyService.updateMemberMeta(
                        {
                            "Default:FrontendEmote_j": {
                                FrontendEmote: {
                                    emoteItemDef: "None",
                                    emoteEKey: "",
                                    emoteSection: -1
                                }
                            },
                        }
                    )
                }
            })
        }

        document.getElementById('outfitBtn').onclick = function () {
            /**
             * @type {Record<string, string>}
             */
            const variants = {};
            Swal.fire(
                {
                    title: 'Set Outfit',
                    html:
                        '<input id="swal-input1" list="outfit_list" placeholder="Renegade Raider" autocapitalize="off" class="swal2-input">'
                        + '<div id="variants-selects" />',
                    showCancelButton: true,
                    confirmButtonText: 'Set',
                    showLoaderOnConfirm: true,
                    /**
                     * 
                     * @param {*} value 
                     * @returns {Datum | string}
                     */
                    preConfirm: async (value) => {
                        const searchBox = document.getElementById('swal-input1');

                        if (searchBox.value.toLowerCase().startsWith('cid_')) {
                            return searchBox.value;
                        }

                        const searchParams = new URLSearchParams(
                            {
                                type: 'outfit'
                            }
                        )

                        if (searchBox.value.toLowerCase().startsWith('cid_')) {
                            searchParams.set('id', searchBox.value);
                        } else {
                            searchParams.set('name', searchBox.value);
                        }

                        try {
                            const outfit = await fetchAPI(
                                `https://fortnite-api.com/v2/cosmetics/br/search?${searchParams}`
                            )

                            return outfit;
                        } catch {
                            Swal.showValidationMessage(
                                `Skin not found`
                            )
                        }
                    },
                    didOpen: async () => {
                        Swal.showLoading();
                        /**
                         * @type {Datum[]}
                         */
                        const Outfits = await outfits;
                        Swal.hideLoading();

                        const searchBox = document.getElementById('swal-input1');
                        const radios = document.getElementById('variants-selects')

                        searchBox.oninput = async function () {
                            const outfit = Outfits.find(x => x.name.toLowerCase() == searchBox.value.toLowerCase());
                            radios.innerHTML = '';
                            if (outfit && outfit.variants && outfit.variants.length > 0) {
                                outfit.variants.forEach((variant, index) => {
                                    const variantLabel = document.createElement('label');
                                    variantLabel.style = 'color: black !important;';
                                    variantLabel.innerText = variant.channel;
                                    const variantEle = document.createElement('select');
                                    variantEle.className = 'swal2-select variant-select';

                                    variantEle.setAttribute('data-trigger', 'hover')
                                    variantEle.setAttribute('data-content', 'hover')

                                    variant.options.forEach(option => {
                                        const optionEle = document.createElement('option');
                                        optionEle.label = option.name;
                                        optionEle.value = option.tag;

                                        variantEle.appendChild(optionEle);
                                    })

                                    variantEle.onchange = () => {
                                        variants[variant.channel] = variantEle.value;
                                    }

                                    radios.appendChild(variantLabel);
                                    radios.appendChild(variantEle);
                                })

                            }
                        }
                    },
                    allowOutsideClick: () => !Swal.isLoading()
                }
            ).then(
                result => {
                    if (!result.isConfirmed) { return; }
                    settings.skinVariants = variants;
                    settings.skin = result.value.id;
                    const heroId = settings.skin.replace(/CID_/i, 'HID_');

                    settings.AthenaCosmeticLoadout.characterDef = `/Game/Athena/Items/Cosmetics/Characters/${result.value.id}.${result.value.id}`;
                    settings.AthenaCosmeticLoadout.characterPrimaryAssetId = `${result.value.type.backendValue}:${result.value.id}`
                    saveSettings(settings);

                    if (partyService.party) {
                        partyService.updateMemberMeta(
                            {
                                "Default:AthenaCosmeticLoadout_j": {
                                    AthenaCosmeticLoadout: settings.AthenaCosmeticLoadout
                                },
                                "Default:CampaignHero_j": {
                                    CampaignHero: {
                                        heroItemInstanceId: "",
                                        heroType: `/Game/Athena/Heroes/${heroId}.${heroId}`
                                    }
                                },
                                "Default:FrontendEmote_j": {
                                    FrontendEmote: {
                                        emoteItemDef: "None",
                                        emoteEKey: "",
                                        emoteSection: -1
                                    }
                                },
                                "Default:AthenaCosmeticLoadoutVariants_j": {
                                    AthenaCosmeticLoadoutVariants: {
                                        vL: {
                                            athenaCharacter: {
                                                i: mapVariants(variants)
                                            }
                                        }
                                    }
                                },
                            }
                        )
                    }
                }
            );
        }

        document.getElementById('backblingBtn').onclick = function () {
            Swal.fire(
                {
                    title: 'Set back bling',
                    input: 'text',
                    inputAttributes: {
                        autocapitalize: 'off',
                        autocomplete: 'on',
                        placeholder: "Bonesy"
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Set',
                    showLoaderOnConfirm: true,
                    preConfirm: async (value) => {
                        const searchParams = new URLSearchParams(
                            {
                                name: value,
                                matchMethod: 'contains'
                            }
                        );

                        try {
                            /**
                             * @type {Datum[]}
                             */
                            const searchResult = await fetchAPI(
                                `https://fortnite-api.com/v2/cosmetics/br/search/all?${searchParams}`
                            )

                            const backblings = searchResult.filter(x => ['backpack', 'petcarrier'].includes(x.type.value));

                            return backblings.find(x => x.name.toLowerCase() == value.toLowerCase()) ||
                                backblings.find(x => x.name.startsWith(value)) ||
                                backblings.find(x => x.name.includes(value))
                        } catch {
                            Swal.showValidationMessage(
                                `Backbling not found`
                            )
                        }


                    },
                    allowOutsideClick: () => !Swal.isLoading()
                }
            ).then(
                result => {
                    if (!result.isConfirmed) { return; };
                    const backpackDef = result.value.path.replace('FortniteGame/Content', '/Game').replace('FortniteGame/Plugins/GameFeatures/BRCosmetics/Content', '/BRCosmetics') + `.${result.value.id}`;
                    settings.backpackDef = backpackDef;
                    settings.AthenaCosmeticLoadout.backpackDef = backpackDef;
                    saveSettings(settings);

                    partyService.updateMemberMeta(
                        {
                            "Default:AthenaCosmeticLoadout_j": {
                                AthenaCosmeticLoadout: settings.AthenaCosmeticLoadout
                            },
                            "Default:FrontendEmote_j": {
                                FrontendEmote: {
                                    emoteItemDef: "None",
                                    emoteEKey: "",
                                    emoteSection: -1
                                }
                            },
                        }
                    )
                }
            );
        }

        document.getElementById('pickaxeBtn').onclick = function () {
            Swal.fire(
                {
                    title: 'Set Harvesting Tool',
                    input: 'text',
                    inputAttributes: {
                        autocapitalize: 'off',
                        autocomplete: 'on',
                        placeholder: "Throwback Axe"
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Set',
                    showLoaderOnConfirm: true,
                    preConfirm: async (value) => {
                        const searchParams = new URLSearchParams(
                            {
                                name: value,
                                type: 'pickaxe',
                                matchMethod: 'contains'
                            }
                        );

                        try {
                            /**
                             * @type {Datum}
                             */
                            const pickaxe = await fetchAPI(
                                `https://fortnite-api.com/v2/cosmetics/br/search?${searchParams}`
                            )

                            return pickaxe;
                        } catch {
                            Swal.showValidationMessage(
                                `Harvesting Tool not found`
                            )
                        }
                    },
                    allowOutsideClick: () => !Swal.isLoading()
                }
            ).then(
                result => {
                    if (!result.isConfirmed) { return; };
                    settings.pickaxe = result.value.id;

                    const pickaxeDef = result.value.path.replace('FortniteGame/Content', '/Game').replace('FortniteGame/Plugins/GameFeatures/BRCosmetics/Content', '/BRCosmetics') + `.${result.value.id}`;
                    settings.AthenaCosmeticLoadout.pickaxeDef = pickaxeDef;
                    saveSettings(settings);

                    partyService.updateMemberMeta(
                        {
                            "Default:AthenaCosmeticLoadout_j": {
                                AthenaCosmeticLoadout: settings.AthenaCosmeticLoadout
                            },
                            "Default:FrontendEmote_j": {
                                FrontendEmote: {
                                    emoteItemDef: "None",
                                    emoteEKey: "",
                                    emoteSection: -1
                                }
                            },
                        }
                    )
                }
            );
        }

        document.getElementById('bannerBtn').onclick = function () {
            var seletedBannerId;
            const bannersPromise = fetchAPI('https://fortnite-api.com/v1/banners')
            /**
             * @type {ApiBanner[]}
             */
            var banners;
            Swal.fire(
                {
                    title: 'Set Banner',
                    html: ``,
                    showCancelButton: true,
                    confirmButtonText: 'Set',
                    didOpen: async (html) => {
                        Swal.showLoading(); html.tagName

                        banners = await bannersPromise;

                        const listEle = document.createElement('ul');

                        listEle.onclick = function (event) {
                            if (event.target.tagName != 'IMG') { return; }
                            singleSelect(event.target.parentElement);
                        }

                        listEle.onmousedown = function () {
                            return false;
                        };

                        function singleSelect(li) {
                            let selected = listEle.querySelectorAll('.selected');
                            for (let elem of selected) {
                                elem.classList.remove('selected');
                            }
                            li.classList.add('selected');
                        }

                        listEle.style = 'display: flex; flex-wrap: wrap; overflow:hidden; overflow-y:scroll; max-height: 400px';

                        banners.forEach(banner => {
                            const ele = document.createElement('li')
                            ele.style.margin = '10px';
                            ele.style.padding = '5px'
                            ele.onclick = () => {
                                seletedBannerId = banner.id;
                            }
                            const img = document.createElement('img');
                            img.src = banner.images.smallIcon
                            img.style.maxHeight = '56px'
                            ele.appendChild(img);
                            listEle.appendChild(ele);
                        })

                        Swal.hideLoading();
                        Swal.getHtmlContainer().style = ''
                        Swal.getHtmlContainer().appendChild(listEle);
                    },
                    allowOutsideClick: () => !Swal.isLoading()
                }
            ).then(
                result => {
                    if (result.isConfirmed) {
                        settings.bannerIcon = seletedBannerId;
                        saveSettings(settings);
                        partyService.updateMemberMeta(
                            {
                                "Default:AthenaBannerInfo_j": {
                                    AthenaBannerInfo: {
                                        bannerIconId: settings.bannerIcon,
                                        bannerColorId: "",
                                        seasonLevel: settings.level
                                    }
                                },
                            }
                        )
                    }
                }
            );
        }

        document.getElementById('levelBtn').onclick = function () {
            Swal.fire(
                {
                    title: 'Set Level',
                    input: 'number',
                    inputAttributes: {
                        autocapitalize: 'off',
                        autocomplete: 'on',
                        placeholder: "200"
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Set'
                }
            ).then(
                result => {
                    if (result.isConfirmed) {
                        settings.level = result.value;
                        saveSettings(settings);
                        partyService.updateMemberMeta(
                            {
                                "Default:AthenaBannerInfo_j": {
                                    AthenaBannerInfo: {
                                        bannerIconId: settings.bannerIcon,
                                        bannerColorId: "",
                                        seasonLevel: settings.level
                                    }
                                },
                            }
                        )
                    }
                }
            );
        }

        document.getElementById('platformBtn').onclick = function () {
            Swal.fire(
                {
                    title: 'Set Platform',
                    footer: 'The page will reload to set the new platfrom',
                    input: 'select',
                    inputValue: settings.platform == '' ? 'none' : settings.platform,
                    inputOptions: {
                        WIN: 'PC',
                        XBL: 'Xbox',
                        AND: 'Phone',
                        SWT: 'Switch',
                        PSN: 'Playstation',
                        none: 'None'
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Apply'
                }
            ).then(
                result => {
                    if (result.isConfirmed) {
                        settings.platform = result.value == 'none' ? '' : result.value;
                        saveSettings(settings);
                        location.reload();

                    }
                }
            );
        }

        document.getElementById('friendsBtn').onclick = function () {
            /**
             * @type {string[]}
             */
            const friendsRemoved = [];

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.value = '1';
            input.id = 'swal2-checkbox';
            input.checked = settings.acceptIncoming;

            Swal.fire(
                {
                    title: 'Manage Friends',
                    confirmButtonText: 'Apply',
                    showCancelButton: true,
                    didOpen: async () => {
                        Swal.showLoading();
                        const summary = await friendsService.queryFriendsSummary();

                        /**
                         * @type {Account[]}
                         */
                        const friendsAccs = (
                            await Promise.all(
                                splitArrayIntoChunksOfLen(summary.friends, 99).map(
                                    /**
                                     * 
                                     * @param {Friend[]} accounts 
                                     * @returns 
                                     */
                                    accounts => accountService.findAccountsByIds(...accounts.map(x => x.accountId))
                                )
                            )
                        ).flat();

                        const container = document.createElement('div');

                        summary.friends.forEach(
                            friend => {
                                const friendContainer = document.createElement('div');
                                friendContainer.style = 'text-align: center;'
                                const friendNameLabel = document.createElement('span');
                                friendNameLabel.innerText = friendsAccs.find(x => x.id == friend.accountId).displayName;
                                friendContainer.appendChild(friendNameLabel);
                                friendNameLabel.style = 'color: #595959!important; ';
                                friendNameLabel.className = 'strikeOut';

                                friendNameLabel.onclick = () => {
                                    friendContainer.style.display = 'none';
                                    friendsRemoved.push(friend.accountId);
                                }
                                container.appendChild(friendContainer);
                            }
                        );

                        // <label for="swal2-checkbox" class="swal2-checkbox" style="display: flex;"><input type="checkbox" value="1" id="swal2-checkbox" checked="${settings.acceptIncoming}"><span class="swal2-label">Automatically accept friends requestes</span></label>
                        const label = document.createElement('label');
                        label.setAttribute('for', 'swal2-checkbox');
                        label.className = 'swal2-checkbox';
                        label.style = 'display: flex;';


                        const span = document.createElement('span');
                        span.className = 'swal2-label';
                        span.innerText = 'Automatically accept friends requestes';

                        label.appendChild(input);
                        label.appendChild(span);

                        Swal.getHtmlContainer().style = '';
                        Swal.getHtmlContainer().appendChild(label);
                        Swal.getHtmlContainer().appendChild(container);
                        Swal.hideLoading();
                    }
                }
            ).then(
                result => {
                    if (result.isConfirmed) {
                        settings.acceptIncoming = input.checked;
                        saveSettings(settings);

                        friendsRemoved.forEach(
                            (id) => friendsService.deleteFriendOrRejectInvite(id)
                        )
                    }
                }
            )

        }

        /*document.getElementById('statusBtn').onclick = function () {
            /**
             * @type {string[]}
             *//*
const friendsRemoved = [];

const input = document.createElement('input');
input.type = 'checkbox';
input.value = '1';
input.id = 'swal2-checkbox';
input.checked = settings.acceptIncoming;

Swal.fire(
{
title: 'Set in-game status',
confirmButtonText: 'Apply',
showCancelButton: true,
input: 'text',
inputAttributes: {
autocapitalize: 'off',
autocomplete: 'on',
placeholder: "beatbot.neonite.net - The best LobbyBot"
},
showCancelButton: true,
confirmButtonText: 'Set',
}
).then(
result => {
if (!result.isConfirmed) {
return;
}

}
)

}*/
    }().catch((error) => {
        if (error instanceof ApiError && error.numericErrorCode == 1014) {
            localStorage.removeItem('account_session_j');
            return location.replace('/login');
        }


        Swal.fire('Whoops, something went wrong', error instanceof ApiError ? error.errorMessage : error instanceof Error ? error.message : error, 'error');
    })
);

