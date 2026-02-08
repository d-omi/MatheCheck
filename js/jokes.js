/**
 * Kinderwitze-Sammlung für MatheCheck.
 */
const Jokes = (() => {
    const jokes = [
        "Warum können Geister so schlecht lügen? – Weil man durch sie hindurchsehen kann!",
        "Was sagt ein großer Stift zum kleinen Stift? – Wachs-mal-Stift!",
        "Was ist grün und steht vor der Tür? – Ein Klopf-Salat!",
        "Warum trinken Mäuse keinen Alkohol? – Weil sie Angst vor dem Kater haben!",
        "Was liegt am Strand und spricht undeutlich? – Eine Nuschel!",
        "Wie nennt man einen Bumerang, der nicht zurückkommt? – Stock.",
        "Was macht ein Pirat am Computer? – Er drückt die Enter-Taste!",
        "Warum hat der Mathematiker Angst vor negativen Zahlen? – Er geht ihnen aus dem Weg!",
        "Was ist orange und geht über die Berge? – Eine Wanderine!",
        "Was sagt der große Teller zum kleinen Teller? – Heute geht die Runde auf mich!",
        "Warum können Seeräuber keinen Kreis zeichnen? – Weil sie Pi raten!",
        "Was ist braun, klebrig und läuft durch die Wüste? – Ein Karamel!",
        "Was sagt der Hammer zum Daumen? – Schön dich zu treffen!",
        "Warum gehen Pilze gern auf Partys? – Weil sie lustige Typen sind!",
        "Was hat vier Beine und kann fliegen? – Zwei Vögel!",
        "Was ist rot und steht am Straßenrand? – Eine Hagenutte!",
        "Wie heißt ein Reh mit Vornamen? – Kartoffelpü-Reh!",
        "Was macht eine Wolke mit Juckreiz? – Sie wird ein Gewitter!",
        "Warum hat die Tomate einen roten Kopf? – Sie hat den Salat nackt gesehen!",
        "Was sagt ein Gen, wenn es ein anderes Gen trifft? – Halogen!",
        "Warum sind Fische so schlau? – Weil sie in Schulen schwimmen!",
        "Was ist weiß und stört beim Essen? – Eine Lawine!",
        "Wie nennt man eine Gruppe von Wölfen? – Wolfgang!",
        "Was sitzt auf dem Baum und ruft Aha? – Ein Uhu mit Sprachfehler!",
        "Was ist gelb und schießt? – Eine Banone!",
        "Warum stehen Flamingos auf einem Bein? – Wenn sie keins hochheben, fallen sie um!",
        "Was macht ein Clown im Büro? – Faxen!",
        "Was ist der Unterschied zwischen einem Krokodil? – Je grüner, desto schwimm!",
        "Was bestellt ein Informatiker im Restaurant? – Chips!",
        "Was sagt der Ozean, wenn er die Küste sieht? – Nichts, er winkt einfach!"
    ];

    let lastIndex = -1;

    /** Gibt einen zufälligen Witz zurück (nicht den gleichen wie zuletzt). */
    function getRandom() {
        let index;
        do {
            index = Math.floor(Math.random() * jokes.length);
        } while (index === lastIndex && jokes.length > 1);
        lastIndex = index;
        return jokes[index];
    }

    return { getRandom };
})();
