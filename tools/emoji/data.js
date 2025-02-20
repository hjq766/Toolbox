const symbolData = {
    common: {
        title: '常用表情',
        categories: {
            faces: {
                title: '表情符号',
                symbols: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '🤗', '🤭', '🤫', '🤔', '🫡', '🤐', '🫢', '🫣', '🥱', '😴', '🤤', '😪', '😮‍💨', '😵‍💫', '🫠']
            },
            emotions: {
                title: '情感表达',
                symbols: ['😤', '😢', '😭', '😦', '😧', '😨', '😩', '🥺', '😬', '😮', '😯', '😲', '😳', '🥴', '😵', '🤯', '😕', '😟', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥱', '😴', '😪', '😮‍💨', '😱', '😰', '😥', '😓', '🫥', '😶', '😶‍🌫️', '😐', '😑', '😯', '😦', '😧', '🥶', '🥵', '😡', '😠', '🤬', '😈', '👿', '🤡', '👻', '💀', '☠️']
            },
            love: {
                title: '爱心表达',
                symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❤️‍🔥', '❤️‍🩹', '💖', '💗', '💓', '💞', '💕', '💝', '💘', '💌', '💋', '💫', '💥', '💭', '💬', '🗯️', '💦', '💨', '🕳️']
            }
        }
    },
    people: {
        title: '人物社交',
        categories: {
            gestures: {
                title: '手势动作',
                symbols: ['👋', '🤚', '✋', '🖐️', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🫶', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🫀', '🫁', '🧠']
            },
            people: {
                title: '人物角色',
                symbols: ['👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👩‍🦱', '🧑‍🦱', '👨‍🦱', '👩‍🦰', '🧑‍🦰', '👨‍🦰', '👱‍♀️', '👱', '👱‍♂️', '👩‍🦳', '🧑‍🦳', '👨‍🦳', '👩‍🦲', '🧑‍🦲', '👨‍🦲', '🧔‍♀️', '🧔', '🧔‍♂️', '👵', '🧓', '👴', '👲', '👳‍♀️', '👳', '👳‍♂️', '🧕', '👮‍♀️', '👮', '👮‍♂️', '👷‍♀️', '👷', '👷‍♂️', '💂‍♀️', '💂', '💂‍♂️', '🕵️‍♀️', '🕵️', '🕵️‍♂️', '👩‍⚕️', '🧑‍⚕️', '👨‍⚕️', '👩‍🌾', '🧑‍🌾', '👨‍🌾', '👩‍🍳', '🧑‍🍳', '👨‍🍳', '👩‍🎓', '🧑‍🎓', '👨‍🎓', '👩‍🎤', '🧑‍🎤', '👨‍🎤']
            },
            family: {
                title: '家庭关系',
                symbols: ['👪', '👨‍👩‍👦', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '👨‍👨‍👦', '👨‍👨‍👧', '👨‍👨‍👧‍👦', '👨‍👨‍👦‍👦', '👨‍👨‍👧‍👧', '👩‍👩‍👦', '👩‍👩‍👧', '👩‍👩‍👧‍👦', '👩‍👩‍👦‍👦', '👩‍👩‍👧‍👧', '👨‍👦', '👨‍👦‍👦', '👨‍👧', '👨‍👧‍👦', '👨‍👧‍👧', '👩‍👦', '👩‍👦‍👦', '👩‍👧', '👩‍👧‍👦', '👩‍👧‍👧']
            },
            daily_actions: {
                title: '日常动作',
                symbols: ['🧖', '🧖‍♂️', '🧖‍♀️', '🛀', '🛌', '🧑‍🤝‍🧑', '👭', '👫', '👬', '💏', '💑', '💆', '💆‍♂️', '💆‍♀️', '💇', '💇‍♂️', '💇‍♀️', '🙋', '🙋‍♂️', '🙋‍♀️', '🙇', '🙇‍♂️', '🙇‍♀️', '🤦', '🤦‍♂️', '🤦‍♀️', '🤷', '🤷‍♂️', '🤷‍♀️', '🙎', '🙎‍♂️', '🙎‍♀️', '🙍', '🙍‍♂️', '🙍‍♀️', '🧏', '🧏‍♂️', '🧏‍♀️', '💁', '💁‍♂️', '💁‍♀️', '🙅', '🙅‍♂️', '🙅‍♀️', '🙆', '🙆‍♂️', '🙆‍♀️']
            }
        }
    },
    life: {
        title: '生活娱乐',
        categories: {
            sports: {
                title: '运动健身',
                symbols: ['🏃', '🏃‍♂️', '🏃‍♀️', '🚶', '🚶‍♂️', '🚶‍♀️', '🧍', '🧍‍♂️', '🧍‍♀️', '🧎', '🧎‍♂️', '🧎‍♀️', '🏋️', '🏋️‍♂️', '🏋️‍♀️', '🤸', '🤸‍♂️', '🤸‍♀️', '⛹️', '⛹️‍♂️', '⛹️‍♀️', '🤾', '🤾‍♂️', '🤾‍♀️', '🏌️', '🏌️‍♂️', '🏌️‍♀️', '🏇', '🧘', '🧘‍♂️', '🧘‍♀️', '🏄', '🏄‍♂️', '🏄‍♀️', '🏊', '🏊‍♂️', '🏊‍♀️', '🤽', '🤽‍♂️', '🤽‍♀️', '🚣', '🚣‍♂️', '🚣‍♀️', '🧗', '🧗‍♂️', '🧗‍♀️', '🚴', '🚴‍♂️', '🚴‍♀️', '🚵', '🚵‍♂️', '🚵‍♀️', '🥋', '🥊', '🤼', '🤼‍♂️', '🤼‍♀️', '🤺', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏆']
            },
            entertainment: {
                title: '娱乐活动',
                symbols: ['🎮', '🎲', '🎭', '🎨', '🎪', '🎯', '🎱', '🎳', '🎰', '🎪', '🎨', '🎭', '🎪', '🎟️', '🎫', '🎗️', '🏵️', '⚽', '⚾', '🏀', '🏐', '🏈', '🏉', '🎾', '🥏', '🎳', '🏏', '🏑', '🏒', '🥍', '🏓', '🏸', '🥅', '⛳', '⛸️', '🎣']
            },
            music_dance: {
                title: '音乐舞蹈',
                symbols: ['💃', '🕺', '🕴️', '👯', '👯‍♂️', '👯‍♀️', '🪩', '🪕', '🎸', '🎻', '🎺', '🎷', '🥁', '🎹', '🪘', '🎼', '🎵', '🎶', '🎧', '🎤', '🎭', '🎪', '🎨', '🎬']
            },
            food: {
                title: '美食饮品',
                symbols: ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥨', '🥪', '🌮', '🌯', '🥗', '🥘', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🍙', '🍚', '🍘', '🥠', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🫖', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉']
            },
            travel: {
                title: '旅行交通',
                symbols: ['✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚁', '🚀', '🛸', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🚚', '🚛', '🚜', '🛵', '🏍️', '🛺', '🚲', '🛴', '🛹', '🛼', '🚏', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏛️', '⛪', '🕌', '🕍', '⛩️', '🕋', '⛲', '⛺', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🗼', '🗽', '⛲', '🎪', '🎭', '🎨', '🎬']
            },
            fruits: {
                title: '新鲜水果',
                symbols: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🫒', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🥜', '🫘', '🌰']
            },
            prepared: {
                title: '食物料理',
                symbols: ['🥐', '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🫕', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫']
            },
            sweets: {
                title: '甜点饮品',
                symbols: ['🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '☕', '🫖', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾']
            },
            asian: {
                title: '亚洲美食',
                symbols: ['🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦪']
            }
        }
    },
    nature: {
        title: '自然世界',
        categories: {
            animals: {
                title: '动物世界',
                symbols: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🦭', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🪶', '🐓', '🦃', '🦤', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥']
            },
            flowers: {
                title: '花卉植物',
                symbols: ['💐', '🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🍄', '🌰', '🦀', '🦞', '🦐', '🦑', '🌵']
            },
            space: {
                title: '天体宇宙',
                symbols: ['🌍', '🌎', '🌏', '🌐', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌙', '🌚', '🌛', '🌜', '🌝', '🌞', '🪐', '⭐', '🌟', '✨', '💫', '☄️', '🌠', '🌌']
            },
            natural: {
                title: '自然现象',
                symbols: ['🌪️', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '🌊', '🌫️', '🌋', '🔥', '💥', '⚡', '✨']
            }
        }
    },
    objects: {
        title: '物品设备',
        categories: {
            clothing: {
                title: '服饰配件',
                symbols: ['👓', '🕶️', '🥽', '🥼', '🦺', '👔', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👗', '👘', '🥻', '🩱', '🩲', '🩳', '👙', '👚', '👛', '👜', '👝', '🎒', '🩴', '👞', '👟', '🥾', '🥿', '👠', '👡', '👢', '👑', '👒', '🎩', '🎓', '🧢', '⛑️', '📿', '💄', '💍', '💎']
            },
            tools: {
                title: '工具用品',
                symbols: ['🔨', '⚒️', '🛠️', '⛏️', '🔧', '🪛', '🔩', '⚙️', '🗜️', '⚖️', '🦯', '🔗', '⛓️', '🪝', '🧰', '🧲', '🪜', '🚪', '🪑', '🚽', '🪠', '🚿', '🛁', '🪤', '🧴', '🧷', '🧹', '🧺', '🧻', '🪣', '🧼', '🫧', '🪥', '🧽', '🧯', '🛟', '🛋️', '🪻', '🪹', '🪺', '🚬', '⚰️', '🗿']
            },
            devices: {
                title: '电子设备',
                symbols: ['📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🔍', '🔎', '🔬', '🔭']
            },
            media: {
                title: '媒体存储',
                symbols: ['💽', '💾', '💿', '📀', '📼', '🎮', '🕹️', '🎲', '🎴', '🔇', '🔈', '🔉', '🔊', '📢', '📣', '📱', '📲', '☎️', '📞', '📟', '📠']
            },
            internet: {
                title: '网络通讯',
                symbols: ['📧', '📨', '📩', '📤', '📦', '📫', '📪', '📬', '📭', '📮', '🗳️', '✉️', '💌', '📱', '📶', '📳', '📴', '💻', '🌐', '💾', '📡', '🛜']
            },
            health: {
                title: '医疗用品',
                symbols: ['💉', '💊', '🩺', '🩹', '🩼', '🩻', '🩸', '🧬', '🦠', '🧪', '🧫', '🧬', '⚕️', '🏥', '🚑', '🩺', '🔬', '🔭',]
            },
            wellness: {
                title: '健康生活',
                symbols: ['🧘', '🧘‍♂️', '🧘‍♀️', '🏃', '🏃‍♂️', '🏃‍♀️', '🍎', '🥗', '💪', '🧠', '🫀', '🫁', '🦷', '🦴', '👁️', '🧬', '🩺']
            },
            money: {
                title: '货币金融',
                symbols: ['💰', '💴', '💵', '💶', '💷', '💸', '💳', '🧾', '💹', '✉️', '📧', '📨', '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🏦', '🏧', '💱', '💲']
            },
            office: {
                title: '办公用品',
                symbols: ['📎', '📏', '📐', '✂️', '📌', '📍', '📋', '📊', '📈', '📉', '📇', '📅', '📆', '📁', '📂', '🗂️', '📰', '🗞️', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '📝', '✏️', '✒️', '🖋️', '🖊️', '🖌️', '🖍️', '📝']
            },
            work: {
                title: '工作场景',
                symbols: ['💼', '🗄️', '📁', '📂', '📅', '📊', '📈', '📉', '📇', '📋', '📌', '📍', '🗑️', '📝', '✏️', '📏', '📐', '🖇️', '📎', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝️']
            }
        }
    },
    symbols: {
        title: '符号标识',
        categories: {
            numbers: {
                title: '数字符号',
                symbols: ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃']
            },
            symbols: {
                title: '特殊符号',
                symbols: ['✅', '☑️', '✔️', '❌', '✖️', '❎', '➕', '➖', '➗', '➰', '➿', '〽️', '✳️', '✴️', '❇️', '‼️', '⁉️', '❓', '❔', '❕', '❗', '〰️', '🅰️', '🆎', '🅱️', '🅾️', '🆑', '🆒', '🆓', 'ℹ️', '🆔', 'Ⓜ️', '🆕', '🆖', '🅿️', '🆗', '🆘', '🆙', '🆚', '🈁', '🈂️', '🈷️', '🈶', '🈯', '🉐', '🈹', '🈚', '🈲', '🉑', '🈸', '🈴', '🈳', '㊗️', '㊙️', '🈺', '🈵', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '⬛', '⬜', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳', '🔲']
            },
            asia: {
                title: '亚洲国旗',
                symbols: ['🇨🇳', '🇭🇰', '🇲🇴', '🇯🇵', '🇰🇷', '🇰🇵', '🇲🇳', '🇻🇳', '🇱🇦', '🇰🇭', '🇹🇭', '🇲🇲', '🇲🇾', '🇸🇬', '🇮🇩', '🇵🇭', '🇮🇳', '🇵🇰', '🇧🇩', '🇳🇵', '🇧🇹', '🇱🇰', '🇲🇻', '🇮🇷', '🇮🇶', '🇸🇦', '🇦🇪', '🇴🇲', '🇯🇴', '🇮🇱', '🇱🇧', '🇰🇼', '🇶🇦', '🇧🇭']
            },
            europe: {
                title: '欧洲国旗',
                symbols: ['🇬🇧', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇵🇹', '🇷🇺', '🇺🇦', '🇵🇱', '🇷🇴', '🇳🇱', '🇧🇪', '🇱🇺', '🇨🇭', '🇦🇹', '🇬🇷', '🇧🇬', '🇭🇺', '🇨🇿', '🇸🇰', '🇸🇮', '🇭🇷', '🇷🇸', '🇸🇪', '🇳🇴', '🇫🇮', '🇩🇰', '🇮🇸', '🇮🇪', '🇱🇹', '🇱🇻', '🇪🇪']
            },
            america: {
                title: '美洲国旗',
                symbols: ['🇺🇸', '🇨🇦', '🇲🇽', '🇧🇷', '🇦🇷', '🇨🇱', '🇵🇪', '🇨🇴', '🇻🇪', '🇪🇨', '🇧🇴', '🇵🇾', '🇺🇾', '🇬🇾', '🇸🇷', '🇵🇦', '🇨🇷', '🇳🇮', '🇭🇳', '🇸🇻', '🇬🇹', '🇧🇿', '🇨🇺', '🇯🇲', '🇭🇹', '🇩🇴', '🇹🇹', '🇧🇸', '🇧🇧']
            },
            oceania: {
                title: '大洋洲国旗',
                symbols: ['🇦🇺', '🇳🇿', '🇵🇬', '🇫🇯', '🇸🇧', '🇻🇺', '🇳🇷', '🇹🇻', '🇰🇮', '🇼🇸', '🇹🇴', '🇫🇲', '🇲🇭', '🇵🇼']
            },
            africa: {
                title: '非洲国旗',
                symbols: ['🇪🇬', '🇿🇦', '🇳🇬', '🇰🇪', '🇪🇹', '🇹🇿', '🇺🇬', '🇷🇼', '🇧🇮', '🇨🇩', '🇨🇬', '🇬🇦', '🇨🇲', '🇸🇳', '🇲🇱', '🇲🇷', '🇲🇦', '🇩🇿', '🇹🇳', '🇱🇾', '🇸🇩', '🇸🇸', '🇪🇷', '🇩🇯', '🇸🇴', '🇬🇭', '🇨🇮', '🇧🇫', '🇳🇪', '🇹🇬', '🇧🇯', '🇬🇳', '🇱🇷']
            },
            other: {
                title: '其他旗帜',
                symbols: ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇺🇳', '🇪🇺']
            }
        }
    },
};
