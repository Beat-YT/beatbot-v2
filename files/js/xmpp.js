/**
 * @type {import('@xmpp/client')}
 */
const { client, xml, jid } = window.XMPP;

class Client extends EventTarget {
    /**
     * 
     * @param {Token} token 
     */
    constructor(token, platform, status) {
        super();
        this.platform = platform;
        this.resource = `V2:Fortnite:${platform}::${generateUUID().replace(/-/g, '')}`;
        this.xmpp = client(
            {
                service: "wss://xmpp-service-prod.ol.epicgames.com",
                domain: "prod.ol.epicgames.com",
                resource: this.resource,
                username: token.account_id,
                password: token.access_token
            }
        );

        this.xmpp.on(
            'stanza', stanza => {
                if (stanza.is('message')) {
                    this.onMessage(stanza);
                }
            }
        );

        this.xmpp.on('online', () => this.onOnline(status));

        this.xmpp.start();

        const ping_iq = xml(
            "iq", { type: 'get' },
            xml(
                "ping", { xmlns: 'urn:xmpp:ping' }
            )
        );

        setInterval(
            () => {
                this.xmpp.send(ping_iq);
            },
            30000
        );
    }

    updatePresence(status) {
        const presence = xml(
            "presence", {},
            xml(
                "status", {},
                JSON.stringify(status, null, 0)
            )
        );
        this.xmpp.send(presence);
    }

    setStatus(status) {
        this.updatePresence(
            {
                "Status": status || "Playing Fortnite",
                "bIsPlaying": false,
                "bIsJoinable": true,
                "bHasVoiceSupport": false,
                "SessionId": "",
                "ProductName": "Fortnite",
                "Properties": {
                    "party.joininfodata.286331153_j": {
                        "bIsPrivate": true
                    },
                    "FortBasicInfo_j": {
                        "homeBaseRating": 0
                    },
                    "FortLFG_I": "0",
                    "FortPartySize_i": 1,
                    "FortSubGame_i": 1,
                    "InUnjoinableMatch_b": false,
                    "FortGameplayStats_j": {
                        "state": "",
                        "playlist": "None",
                        "numKills": 0,
                        "bFellToDeath": false
                    }
                }
            }
        );
    }

    onOnline(status) {
        this.updatePresence(
            {
                "Status": status || "Playing Fortnite",
                "bIsPlaying": false,
                "bIsJoinable": true,
                "bHasVoiceSupport": false,
                "SessionId": "",
                "ProductName": "Fortnite",
                "Properties": {
                    "party.joininfodata.286331153_j": {
                        "bIsPrivate": true
                    },
                    "FortBasicInfo_j": {
                        "homeBaseRating": 0
                    },
                    "FortLFG_I": "0",
                    "FortPartySize_i": 1,
                    "FortSubGame_i": 1,
                    "InUnjoinableMatch_b": false,
                    "FortGameplayStats_j": {
                        "state": "",
                        "playlist": "None",
                        "numKills": 0,
                        "bFellToDeath": false
                    }
                }
            }
        );

        const event = new CustomEvent("ready");
        this.dispatchEvent(event);
    }

    onMessage(stanza) {
        if (stanza.attrs.from != "xmpp-admin@prod.ol.epicgames.com") {
            return;
        }

        const messageString = stanza.children.find(x => x.name == "body").children[0];
        const parsedMessage = JSON.parse(messageString);

        if (typeof parsedMessage.type != 'string') {
            return;
        }

        console.log('Event from xmpp:', parsedMessage.type, parsedMessage)

        const event = new CustomEvent(parsedMessage.type, { detail: parsedMessage });
        this.dispatchEvent(event);
    }
}
