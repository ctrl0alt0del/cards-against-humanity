export const Avatars = [
    {
        id: 'lisa',
        src: 'https://i.pinimg.com/originals/7b/62/41/7b62412e2f80743ea75a36ed4b549198.jpg',
        name: 'Ліза Сімпсон'
    },
    {
        id: 'squid',
        src: 'https://i.pinimg.com/736x/82/9f/f6/829ff6c6803bae240547c244f4056358.jpg',
        name: "Сквідвард Щупаленко"
    },
    {
        id: "spongebob",
        src: "https://i.pinimg.com/474x/4b/38/df/4b38dfbb7b66deee45007be76a4fa366.jpg",
        name: "Губка Боб"
    },
    {
        id: "homer",
        src: "https://i.pinimg.com/originals/12/52/c7/1252c79a5c301f1d5515a1e4e66f9962.jpg",
        name: "Гомер Сімпсон"
    },
    {
        id: 'ruslan',
        src: '/photo_152@23-02-2019_21-46-36.jpg'
    },
    {
        id: 'vitalik',
        src: '/121.png'
    },
    {
        id: 'nastya',
        src: '/photo_356@01-06-2019_22-29-56.jpg'
    },
    {
        id: 'shahin',
        src: '/photo_503@18-08-2019_19-53-40.jpg'
    },
    {
        id: 'bedratuk',
        src: '/photo_665@28-11-2019_14-57-22.jpg'
    },
    {
        id: 'popelinov',
        src: '/photo_528@30-08-2019_21-47-21.jpg'
    },
    {
        id: 'diana',
        src: '/photo_2019-09-12_23-10-27.jpg'
    }
];

export function getAvatarSrc(avatarId: string) {
    return Avatars.find(avatar => avatar.id === avatarId)?.src || null;
}