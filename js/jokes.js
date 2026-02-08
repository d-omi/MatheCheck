/**
 * Kinderwitze-Sammlung fuer MatheCheck.
 */
const Jokes = (() => {
    const jokes = [
        "Warum koennen Geister so schlecht luegen? – Weil man durch sie hindurchsehen kann!",
        "Was sagt ein grosser Stift zum kleinen Stift? – Wachs-mal-Stift!",
        "Was ist gruen und steht vor der Tuer? – Ein Klopf-Salat!",
        "Warum trinken Maeuse keinen Alkohol? – Weil sie Angst vor dem Kater haben!",
        "Was liegt am Strand und spricht undeutlich? – Eine Nuschel!",
        "Wie nennt man einen Bumerang, der nicht zurueckkommt? – Stock.",
        "Was macht ein Pirat am Computer? – Er drueckt die Enter-Taste!",
        "Warum hat der Mathematiker Angst vor negativen Zahlen? – Er geht ihnen aus dem Weg!",
        "Was ist orange und geht ueber die Berge? – Eine Wanderine!",
        "Was sagt der grosse Teller zum kleinen Teller? – Heute geht die Runde auf mich!",
        "Warum koennen Seeraeuber keinen Kreis zeichnen? – Weil sie Pi raten!",
        "Was ist braun, klebrig und laeuft durch die Wueste? – Ein Karamel!",
        "Was sagt der Hammer zum Daumen? – Schoen dich zu treffen!",
        "Warum gehen Pilze gern auf Partys? – Weil sie lustige Typen sind!",
        "Was hat vier Beine und kann fliegen? – Zwei Voegel!",
        "Was ist rot und steht am Strassenrand? – Eine Hagenutte!",
        "Wie heisst ein Reh mit Vornamen? – Kartoffelpue-Reh!",
        "Was macht eine Wolke mit Juckreiz? – Sie wird ein Gewitter!",
        "Warum hat die Tomate einen roten Kopf? – Sie hat den Salat nackt gesehen!",
        "Was sagt ein Gen, wenn es ein anderes Gen trifft? – Halogen!",
        "Warum sind Fische so schlau? – Weil sie in Schulen schwimmen!",
        "Was ist weiss und stoert beim Essen? – Eine Lawine!",
        "Wie nennt man eine Gruppe von Woelfen? – Wolfgang!",
        "Was sitzt auf dem Baum und ruft Aha? – Ein Uhu mit Sprachfehler!",
        "Was ist gelb und schiesst? – Eine Banone!",
        "Warum stehen Flamingos auf einem Bein? – Wenn sie keins hochheben, fallen sie um!",
        "Was macht ein Clown im Buero? – Faxen!",
        "Was ist der Unterschied zwischen einem Krokodil? – Je gruener, desto schwimm!",
        "Was bestellt ein Informatiker im Restaurant? – Chips!",
        "Was sagt der Ozean, wenn er die Kueste sieht? – Nichts, er winkt einfach!"
    ];

    let lastIndex = -1;

    /** Gibt einen zufaelligen Witz zurueck (nicht den gleichen wie zuletzt). */
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
