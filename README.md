# Palabras

**Spanish sentence practice from Spanish I through AP Spanish Language, with Felicísimo the tutor cat.**

**Use it here: https://janavduraikkannan.github.io/palabras/**

Part of **[Linguae](https://janavduraikkannan.github.io/linguae/)**, the home page for every language site, with one account for all of them.

Palabras is the Spanish sister site of [Verba](https://janavduraikkannan.github.io/verba/) (Latin). It builds fresh Spanish sentences from the topics you pick, then has you translate the whole sentence, English to Spanish or Spanish to English. It checks your answer, tells you exactly what went wrong, and lets you ask Felicísimo, an AI tutor, questions about the grammar along the way.

> **Privacy, in short:** Palabras has no server of its own. Your practice runs in your browser, your AI key goes straight from your browser to the AI company you chose, and nothing is saved anywhere else unless you make an account. If you do, your account and anything you put on the leaderboard are stored with Google Firebase, are **not encrypted**, and **are not private**. Read the full [Privacy Statement](PRIVACY.md) before making an account.

## What it does

- **Topics by course.** Grammar topics grouped under Spanish I, Spanish II, Spanish III Honors, Spanish IV Honors and AP Spanish Language: from articles, ser and estar and the present tense, through the preterite and imperfect, object pronouns and commands, to every use of the subjunctive and si clauses.
- **Topics from real class notes.** Spanish I Honors and Spanish II Honors notes from Collierville High School are built in: telling time, dates, weather, numbers to 1,000, clothes and colors, the present-tense irregular lists (-go, -zco, -jo, -uir verbs), the preterite (regular, -car/-gar/-zar, stem changers, i → y, irregular stems), direct object pronouns, verbs like gustar, and the present and past perfect, plus the notes' vocabulary (school, errands, getting ready, shopping). Topics the notes cover are shaded, and **Select the shaded topics** picks them all. Felicísimo knows the class's memory aids, like "All Corn Dies Early" for the irregular past participles.
- **Build your own sentence type.** Pick a main structure (statement, question, verb + infinitive, ir a, command, si clause) and what goes inside it (adjectives, possessives, object pronouns, places, time expressions, a tense).
- **Focus.** Press Focus on any topic and every sentence will practice it, mixing in your other ticked topics.
- **Whole-sentence translation**, checked first by the site and then, if needed, by the AI, so other correct versions are accepted too.
- **Identify the use.** See a highlighted word and name why it's used: the use of ser or estar, por or para, the preterite or imperfect, or what triggers the subjunctive. Typed for full XP, or multiple choice for half.
- **Extra credit** after a translation. Opening that use's chart voids it.
- **Fair accent checking.** A missing accent is pointed out but still counts as correct, unless it changes the word (hablo / habló, esta / está, el / él). Type accents with the buttons, or type `a'` for á and `n~` for ñ.
- **Felicísimo, the AI tutor cat.** Fēlix's Spanish cousin. Before you answer, he judges whether a question gives away too much; after you answer, you can ask anything.
- **Charts for each sentence** (the tenses and pronouns it uses) and a vocabulary list, shown by default and easy to hide.
- **Vosotros optional.** Ustedes is always used and accepted; tick "Use vosotros" to practice the forms used in Spain too.
- **XP, levels and streaks**, from Estudiante to Leyenda, and a Corona for finishing AP Spanish.

## Accounts are shared with Verba

One account works on both sites. Your **account key, username, password, profile and saved AI key** are shared. Your **XP, levels, streaks, topics and course are separate for each language**, and each site has its own leaderboard. Spanish progress is saved in its own part of the same account document, so saving on one site never erases the other.

## How it works

Palabras is a static website hosted on GitHub Pages, with no server and no build step.

| Path | What it is |
| --- | --- |
| `index.html` | The whole app: the Spanish sentence engine, answer checker, interface and account code |
| `js/usemode.js` | The identify-the-use tab, shared by every site: choosing which uses to drill (shaded when the class notes cover them), English or target-language sentences, AI grading for typed uses, and "Mark my answer as correct". New features go in their own files like this one and are linked from `index.html` |
| `css/usemode.css` | Styles for the identify-the-use tab |
| `js/moreuses.js` | This site's uses beyond the ones in the engine, so the identify-the-use tab covers every case or form use in the course |
| `getkey.html` | Guide to getting a free Groq key |
| `keys.html` | Every AI provider that works, with free limits |
| `img/felicisimo/` | Felicísimo, in every mood |
| `img/icons/` | Interface icons |
| `media/` | The key tutorial video, its captions and poster |
| `tools/felicisimo.py` | The script that draws Felicísimo (adapted from Verba's Fēlix script) |

## Contributing and issues

Suggestions, bug reports and pull requests are welcome, but none are guaranteed to be read, answered or accepted. See **[Contributing](CONTRIBUTING.md)**. **Never post an account key, a password or an AI key in an issue or pull request.**

## Credits

- Icons by Lorc and Delapouite from [game-icons.net](https://game-icons.net), [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) (see `img/icons/LICENSE-game-icons.txt`), including the guitar (Lorc) and castle (Delapouite).
- Day and night switch after Adam Argyle, "Building a theme switch component" ([web.dev](https://web.dev/articles/building/a-theme-switch-component), Apache 2.0), with a sun from [Feather Icons](https://feathericons.com) (MIT) and easings from [Open Props](https://open-props.style) (MIT).
- Confetti by [canvas-confetti](https://github.com/catdad/canvas-confetti) (ISC).
- Profile pictures come from [Wikimedia Commons](https://commons.wikimedia.org); each picture's author and license are shown on the site.
- Fonts: Fraunces, Figtree and Gentium Book Plus, from [Google Fonts](https://fonts.google.com) (SIL Open Font License).
- Felicísimo was drawn for Palabras, from Verba's Fēlix.

## License

No license has been chosen yet, so all rights are reserved by the owner. The third-party pieces listed under Credits keep their own licenses.
