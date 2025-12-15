import {
    Avatar,
    Button,
    Card,
    CardBody,
    Input,
    ScrollShadow,
    Tabs,
    Tab,
    Badge
} from "@heroui/react"
import {
    Search,
    Bell,
    Phone,
    MoreVertical,
    Send,
    Paperclip,
    Smile
} from "lucide-react"

export default function Messages() {
    return (
        // Utilisez 'h-full' ou 'min-h-screen' si ce composant ne prend pas toute la hauteur
        <div className="h-screen flex bg-background">

            {/* SIDEBAR (Conversation List) */}
            <aside className="w-[360px] border-r flex flex-col">
                {/* Header: Titre Accenté */}
                <div className="p-5 border-b">
                    <h1 className="text-2xl font-bold text-default-800">Messagerie</h1>
                    <p className="text-sm text-default-500">
                        Agent Loueur Partenaire
                    </p>
                </div>

                {/* Search */}
                <div className="p-4">
                    <Input
                        startContent={<Search size={18} />}
                        placeholder="Rechercher une conversation..."
                    />
                </div>

                {/* Filters */}
                <Tabs
                    aria-label="Filtres"
                    className="px-4"
                    variant="light"
                >
                    <Tab key="all" title="Tous" />
                    <Tab key="unread" title="Non lus" />
                    <Tab key="clients" title="Clients" />
                </Tabs>

                {/* Conversations: Scrollable */}
                <ScrollShadow className="flex-1">
                    <Conversation active name="Marie Dubois" message="Question sur l'assurance du véhicule..." time="14:32" initials="MD" />
                    <Conversation name="Pierre Martin" message="Merci pour la réservation rapide" time="13:15" initials="PM" />
                    <Conversation name="Sophie Laurent" message="Quand puis-je récupérer la voiture ?" time="12:08" initials="SL" />
                    <Conversation name="Support ARC" message="Rappel : Formation mensuelle demain" time="11:30" initials="SA" />
                    <Conversation name="Client Test 1" message="Message de test 1" time="11:00" initials="C1" />
                    <Conversation name="Client Test 2" message="Message de test 2" time="10:45" initials="C2" />
                    <Conversation name="Client Test 3" message="Message de test 3" time="10:30" initials="C3" />
                    <Conversation name="Client Test 4" message="Message de test 4" time="10:15" initials="C4" />
                    <Conversation name="Client Test 5" message="Message de test 5" time="10:00" initials="C5" />
                    <Conversation name="Client Test 6" message="Message de test 6" time="09:45" initials="C6" />
                    <Conversation name="Client Test 7" message="Message de test 7" time="09:30" initials="C7" />
                </ScrollShadow>
            </aside>

            {/* CHAT (Zone Principale) */}
            <main className="flex-1 flex flex-col">

                {/* Top bar: Titre de conversation accenté */}
                <div className="flex items-center justify-between p-5 border-b">
                    <div className="flex items-center gap-3">
                        <Avatar name="Marie Dubois" className="bg-orange-400 text-white" />
                        <div>
                            {/* Titre de conversation mis en évidence */}
                            <p className="text-lg font-bold text-default-900">Marie Dubois</p>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 rounded-full bg-success" />
                                <span className="text-default-500">En ligne</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button isIconOnly variant="light">
                            <Phone size={18} />
                        </Button>
                        <Button isIconOnly variant="light">
                            <MoreVertical size={18} />
                        </Button>
                    </div>
                </div>

                <ScrollShadow className="flex-1 px-8 py-6 space-y-6">
                    <Message left text="Est-ce que l'assurance tous risques est incluse dans le tarif de 180€ pour 3 jours ?" time="14:30" />
                    <Message right text="Oui, le tarif inclut bien l'assurance tous risques avec une franchise de 500€. Vous pouvez également opter pour une option zéro franchise à +15€/jour." time="14:31" />
                    <Message left text="Parfait ! Et pour la carte grise, j'ai bien besoin de ma carte d'identité et de mon permis de conduire uniquement ?" time="14:32" />
                    <Message right text="C'est exact ! Et n'oubliez pas votre justificatif de domicile de moins de 3 mois." time="14:33" />

                    {/* Ajout de messages pour tester le défilement (simuler une longue conversation) */}
                    <p className="text-center text-xs text-default-400 my-4 pt-8">Hier</p>
                    {Array(20).fill(0).map((_, i) => (
                        <Message
                            key={i}
                            left={i % 2 === 0}
                            text={`Message de test ${i + 1}. Ceci est un message pour tester le défilement de la conversation.`}
                            time={`0${Math.floor(Math.random() * 9)}:0${Math.floor(Math.random() * 9)}`}
                        />
                    ))}
                    <Message left text="Super, merci pour toutes ces précisions." time="09:00" />
                </ScrollShadow>

                {/* ANCIEN FOOTER SUPPRIMÉ */}
            </main>
        </div>
    )
}

/* ================= COMPONENTS ================= */

function Conversation({ name, message, time, initials, active }) {
    return (
        <div
            className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition
      ${active ? "bg-default-100 border-l-4 border-primary" : "hover:bg-default-100"}`}
        >
            <Avatar
                name={initials}
                className="bg-orange-400 text-white"
            />
                <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-default-800">{name}</p>
                    <p className="text-sm text-default-500 truncate">
                        {message}
                    </p>
                </div>
            <span className="text-xs text-default-400">{time}</span>
        </div>
    )
}

function Message({ text, time, left }) {
    return (
        <div className={`flex ${left ? "justify-start" : "justify-end"}`}>
            <Card
                className={`max-w-[60%] ${
                    left
                        ? "bg-default-100"
                        : "bg-primary text-white"
                }`}
            >
                <CardBody>
                    <p className="text-sm leading-relaxed">{text}</p>
                    <p className="text-xs opacity-70 text-right mt-1">
                        {time}
                    </p>
                </CardBody>
            </Card>
        </div>
    )
}