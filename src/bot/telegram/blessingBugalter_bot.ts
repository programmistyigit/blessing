import TelegramBot from "node-telegram-bot-api";
import { businesmens, business_spaces, periots } from "../../mongoDB/model";
import { createStringTable } from "../../utils";
const token = process.env.BOT_TOKEN as string;

const admin: { chatId: string }[] = []
let isSehAdding = false;

const startBlessingBugalter = (verifyJwt: any): void => {
    const Bot = new TelegramBot(token, { polling: true })
    Bot.onText(/\/start/, (msg) => {
        Bot.sendMessage(msg.chat.id, "tasdiqlash tokeningizni jonating \n uni web saytning profila bolimida sozlamalar qatoridan topishingiz mumkun!")
    })

    Bot.onText(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/, (msg) => {
        Bot.sendMessage(msg.chat.id, "tekshirilmoqda")
        const token = msg.text;
        const data = verifyJwt(token) as { _id: string }
        if (!data) {
            Bot.sendMessage(msg.chat.id, "token xato")
            return
        }
        admin.push({ chatId: msg.chat.id.toString() })
        Bot.sendMessage(msg.chat.id, `saved yor data : admin_ID=${data._id}`, {
            reply_markup: {
                keyboard: [
                    [
                        {
                            text: "📊 Hisobotlar",
                        },
                        {
                            text: "Xarajatni qoshish",
                        },
                        {
                            text: "seh qoshish"
                        }

                    ],
                    [
                        {
                            text: "botdan hisobni chiqarish"
                        }
                    ]
                ],
                remove_keyboard: true
            }
        })

    })
    Bot.onText(/📊 Hisobotlar/, (msg) => {
        if (admin.find((item) => item.chatId === msg.chat.id.toString())) {
            Bot.sendMessage(
                msg.chat.id,
                "Hisobotlar turini tanlang",
                {
                    reply_markup: {
                        remove_keyboard: true,
                        "inline_keyboard": [
                            [
                                {
                                    "text": "excel",
                                    "callback_data": "getExcelFile"
                                },
                                {
                                    "text": "matn",
                                    "callback_data": "getMatnData"
                                }
                            ]
                        ]
                    }
                }
            )
        }

    })
    Bot.on("callback_query", async (callbackQuery) => {
        const chatId = callbackQuery.message?.chat.id
        if (!chatId) return;

        if (admin.find((item) => item.chatId === chatId.toString())) {
            if (callbackQuery.data === "getExcelFile") {
                Bot.sendMessage(chatId, "Excel file");
            } else if (callbackQuery.data === "getMatnData") {
                const businesmen = await businesmens.find({})
                if (!businesmen[0].current_periot) return;
                const periot = await periots.findById(businesmen[0].current_periot);
                if (!periot) return;
                await periot.populate({ path: 'number_of_chicks_sold.number', strictPopulate: true });
                await periot.populate({ path: 'number_of_chicks.number', strictPopulate: true });

                const totalSoldChicks = periot.number_of_chicks_sold.reduce((acc: number, item: any) => {
                    return acc + item.number;
                }, 0);
                const totalDeadChicks = periot.number_of_dead_chicks.reduce((acc: number, item: any) => {
                    return acc + item.number;
                }, 0);

                const totalInitChicks = periot.number_of_initial_chicks.reduce((acc: number, item: any) => {
                    return acc + item.number;
                }, 0);

                const totalChicks = totalInitChicks - totalDeadChicks - totalSoldChicks;
                const payload = { boshlangich_soni: totalInitChicks, sotilgan_soni: totalSoldChicks, "o'lgan_soni": totalDeadChicks, qolgan_soni: totalChicks }
                const stringTable = createStringTable([payload])
                Bot.sendMessage(chatId, stringTable)
            }
        }
    });
    Bot.onText(/Xarajatni qoshish/, (msg) => {
        if (admin.find((item) => item.chatId === msg.chat.id.toString())) {
            Bot.sendMessage(
                msg.chat.id,
                "Xarajatni qoshish",
                {
                    reply_markup:
                    {
                        remove_keyboard: true,
                        keyboard: [
                            [
                                {
                                    text: "🐣 Jo'jalar",
                                },
                                {
                                    text: "🍼 Dori darmon",
                                },
                                {
                                    text: "🍚 Jo'ja ovqati",
                                }
                            ],
                            [
                                {
                                    text: "ishchi oyligi",
                                },
                                {
                                    text: "yangi narsa olish"
                                },
                                {
                                    text: "bir martalik ishchilar"
                                },
                            ],
                            [
                                { text: "🔙 Orqaga" }
                            ]
                        ]
                    }
                }
            )

        }
    })

    Bot.onText(/botdan hisobni chiqarish/, (msg) => {
        const isAdmin = admin.find((item) => item.chatId === msg.chat.id.toString())
        if (isAdmin) {
            admin.splice(admin.indexOf(isAdmin), 1)
            Bot.sendMessage(msg.chat.id, "botdan hisobni chiqarildi", { reply_markup: { remove_keyboard: true } })
        }
    })

    Bot.onText(/🐣 Jo'jalar/, async (msg) => {
        const arrKay = [
            {
                text: "🔙 Orqaga"
            },
            { 
                text: "saqlash✅"
            }

        ]
        if (admin.find((item) => item.chatId === msg.chat.id.toString())) {
            const allSpace = await business_spaces.find({})
            if (allSpace.length === 0) return Bot.sendMessage(msg.chat.id, "Hali Sehlar mavjud emas");
            const spacePayload = allSpace.map((item) => ({ text: item.name }))
            const keyboard = []
            if (spacePayload.length > 3) {
                for (let i = 0; i < spacePayload.length; i += 3) {
                    keyboard.push(spacePayload.slice(i, i + 3))
                }

            } else keyboard.push(spacePayload);
            keyboard.push(arrKay)
            Bot.sendMessage(
                msg.chat.id,
                "Sehlar tanlang",
                {
                    reply_markup:
                    {
                        remove_keyboard: true,
                        keyboard: keyboard
                    }
                }
            )

        }
    });
    Bot.onText(/🍼 Dori darmon/, msg => { });
    Bot.onText(/🍚 Jo'ja ovqati/, msg => { });
    Bot.onText(/ishchi oyligi/, msg => { });
    Bot.onText(/yangi narsa olish/, msg => { });
    Bot.onText(/bir martalik ishchilar/, msg => { });
    Bot.onText(/🔙 Orqaga/, msg => {
        if (admin.find((item) => item.chatId === msg.chat.id.toString())) {
            Bot.sendMessage(
                msg.chat.id,
                "Menuni tanlang",
                {
                    reply_markup: {
                        remove_keyboard: true,
                        keyboard: [
                            [
                                {
                                    text: "📊 Hisobotlar",
                                },
                                {
                                    text: "Xarajatni qoshish",
                                },
                                {
                                    text: "seh qoshish"
                                }

                            ],
                            [
                                {
                                    text: "botdan hisobni chiqarish"
                                }
                            ]
                        ],
                    }
                }
            )
        }
    });

    Bot.onText(/seh qoshish/, msg => {
        if (admin.find(item => item.chatId == msg.chat.id.toString())) {
            Bot.sendMessage(msg.chat.id, "seh uchun nom tanlang u oldindan bazada bolmasligi shart", {
                reply_markup: {
                    remove_keyboard: true
                }
            })
            isSehAdding = true
        }
    })

    Bot.on("message", async (msg) => {

        if (isSehAdding && admin.find(item => item.chatId === msg.chat.id.toString())) {
            const sehNomi = msg.text;
            const exitingName = await business_spaces.findOne({ name: sehNomi })
            if (exitingName) return Bot.sendMessage(msg.chat.id, "boshqa nom tanlang bu nom band!");
            await business_spaces.create({ name: sehNomi });
            const allSpace = await business_spaces.find({});
            const payloadStringTable = allSpace.map((e, i) => `${i}) nomi: ${e.name}, holati: ${e.status}`).join("\n")

            Bot.sendMessage(msg.chat.id, payloadStringTable, {
                reply_markup: {
                    remove_keyboard: true,
                    keyboard: [
                        [
                            {
                                text: "📊 Hisobotlar",
                            },
                            {
                                text: "Xarajatni qoshish",
                            },
                            {
                                text: "seh qoshish"
                            }

                        ],
                        [
                            {
                                text: "botdan hisobni chiqarish"
                            }
                        ]
                    ],
                }
            });

            isSehAdding = false
        }
    });
}


export default startBlessingBugalter