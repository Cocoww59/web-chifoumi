/**
 * @class Game représente une partie
 */
export default class Game {

    /**
     * @property {number} innings
     * @private
     * @default 3
     */
    #innings = 3;
    /**
     * @property {number} INNINGS_MAX
     * @private
     * @default 10
     */
    #INNINGS_MAX = 10;
    /**
     * @property {number} inningsCurrent
     * @private
     * @default 0
     */
    #inningsCurrent = 0;

    /**
     * Énumération uniquement disponible en TS, alternative en JS Object.freeze(), Symbol() pour s'assurer d'une valeur unique
     * 
     * @property {Object (Enum)} GAME_STATUS
     * @private
     */
    #GAME_STATUS = Object.freeze({
        PRE_GAME: Symbol("PRE_GAME"),
        IN_GAME: Symbol("IN_GAME"),
        AFTER_GAME: Symbol("AFTER_GAME")
    });

    /**
     * @property {#GAME_STATUS} GAME_STATUS_CURRENT
     * @private
     * @default this.#GAME_STATUS.PRE_GAME
     */
    #GAME_STATUS_CURRENT = this.#GAME_STATUS.PRE_GAME;

    /**
     * @property {HTMLElement|null} gameViewPreGame
     * @private
     */
    #gameViewPreGame = document.getElementById("game-view__pre-game");
    /**
     * @property {HTMLElement|null} gameViewInGame
     * @private
     */
    #gameViewInGame = document.getElementById("game-view__in-game");
    /**
     * @property {HTMLElement|null} gameViewAfterGame
     * @private
     */
    #gameViewAfterGame = document.getElementById("game-view__after-game");
    /**
     * @property {NodeList} gameViews
     * @private
     */
    #gameViews = [this.#gameViewPreGame, this.#gameViewInGame, this.#gameViewAfterGame];

    /**
     * @property {Object} possibleChoices
     * @private
     */
    #possibleChoices = {
        "Pierre": ["Ciseaux"],
        "Feuille": ["Pierre"],
        "Ciseaux": ["Feuille"]
    };

    /**
     * @property {number} wins
     * @private
     */
    #wins = 0;
    /**
     * @property {number} looses
     * @private
     */
    #looses = 0;

    constructor() {

        this.#setDynamicViewsDOM();

    }

    /**
     * @param {gameView} null
     */
    #setDynamicViewsDOM(gameView = null) {

        if(!this.#gameViewPreGame || !this.#gameViewInGame || !this.#gameViewAfterGame) return;

        if(gameView) {

            this.#gameViews.forEach(_gameView => {
                _gameView.style.setProperty("display", (_gameView === gameView ? "" : "none"));
            });
            return;

        }

        // PreGame
        const gameViewPreGameHTML = `
            <button id="btn-update-innings" class="btn-update">
                Nombre de manche(s) :
                <span class="nb-innings">${this.#innings}</span>
            </button>
            <button id="btn-action-start" class="btn-action">
                Lancer
            </button>
        `;

        this.#gameViewPreGame.innerHTML = gameViewPreGameHTML;

        document.getElementById("btn-update-innings").addEventListener("click", this.#updateNbInnings(this.#INNINGS_MAX));
        document.getElementById("btn-action-start").addEventListener("click", this.#start);

        // InGame
        let gameViewInGameHTML = `<div class="flex-row">`;
        for(const choice in this.#possibleChoices) {
            gameViewInGameHTML += `
                <button class="btn-choice">
                    ${choice}
                </button>
            `;
        }
        gameViewInGameHTML += `
            </div>
            <p id="message-infos" class="message">&nbsp</p>
            <button id="btn-action-view-score" class="btn-action" style="visibility: hidden;">Mes scores</button>
        `;

        this.#gameViewInGame.innerHTML = gameViewInGameHTML;
        this.#gameViewInGame.style.setProperty("display", "none");

        this.#gameViewInGame.querySelectorAll(".btn-choice").forEach(btn => btn.addEventListener("click", this.#choice()));
        this.#gameViewInGame.querySelector("#btn-action-view-score").addEventListener("click", this.#stop);

    }

    /**
     * Écoute le choix choisi par l'utilisateur
     * 
     * @return {listener}
     */
    #choice() {

        /* Dû au changement de contexte du mot this lors d'un event, self aura l'instance de Game */
        const self = this;

        const classInfos = ["equal", "win", "loose"];

        /* Fonction qui se déclenchera lors de l'event, this aura alors comme contexte l'élément qui a déclenché l'event */
        return function() {

            if(self.#GAME_STATUS_CURRENT === self.#GAME_STATUS.IN_GAME) {

                const choice = this.textContent.trim();

                if(Object.hasOwn(self.#possibleChoices, choice)) {

                    const choices = Object.keys(self.#possibleChoices);

                    const choiceIA = choices[Math.floor(Math.random() * choices.length)];

                    let messageInfosEl = self.#gameViewInGame.querySelector("#message-infos");
                    let messageInfos = "&nbsp";

                    classInfos.forEach(_class => messageInfosEl.classList.remove(_class));
                    
                    if(choice === choiceIA) {

                        messageInfosEl.classList.add(classInfos[0]);

                    } else {
                        
                        const possibilitiesWin = self.#possibleChoices[choice];

                        if(possibilitiesWin.includes(choiceIA)) {

                            self.#wins++;
                            messageInfosEl.classList.add(classInfos[1]);

                        } else {

                            self.#looses++;
                            messageInfosEl.classList.add(classInfos[2]);

                        }

                    }
                    messageInfos = `${choice} Vs ${choiceIA}`;

                    messageInfosEl.textContent = messageInfos;

                    self.#inningsCurrent++;
                    
                    if(self.#inningsCurrent === self.#innings) {
                        self.#GAME_STATUS_CURRENT = self.#GAME_STATUS.AFTER_GAME;
                        self.#gameViewInGame.querySelector("#btn-action-view-score").style.setProperty("visibility", "visible");
                    }

                }

            }

        }

    }

    /**
     * Son rôle est d'arrêter la partie et d'afficher les scores
     */
    #stop = () => {

        if(this.#GAME_STATUS_CURRENT === this.#GAME_STATUS.AFTER_GAME) {

            this.#gameViewAfterGame.innerHTML = `
                <p>Manche(s) gagnée(s) : ${this.#wins}</p>
                <p>Manche(s) perdue(s) : ${this.#looses}</p>
                <p>Manche(s) égalité(s) : ${this.#innings - (this.#wins + this.#looses)}</p>
                <button>Relancer</button>
            `;

            this.#setDynamicViewsDOM(this.#gameViewAfterGame);

        }

    }

    /**
     * S'occupe du lancement de la partie, utilisation de la fonction fléchée pour avoir le bon contexte de this
     */
    #start = () => {

        if(this.#GAME_STATUS_CURRENT === this.#GAME_STATUS.PRE_GAME) {

            this.#GAME_STATUS_CURRENT = this.#GAME_STATUS.IN_GAME;

            this.#setDynamicViewsDOM(this.#gameViewInGame);

        }

    }
    
    /**
     * Mets à jour le nombre de manches lors de l'avant partie
     * 
     * @return {listener}
     */
    #updateNbInnings() {

        /* Dû au changement de contexte du mot this lors d'un event, self aura l'instance de Game */
        const self = this;

        /* Fonction qui se déclenchera lors de l'event, this aura alors comme contexte l'élément qui a déclenché l'event */
        return function() {

            if(self.#GAME_STATUS_CURRENT === self.#GAME_STATUS.PRE_GAME) {

                const nbInningsElement = this.firstElementChild;
                const nbInnings = parseInt(nbInningsElement.textContent);

                nbInningsElement.textContent = ((isNaN(nbInnings) || nbInnings === self.#INNINGS_MAX) ? 1 : nbInnings + 1);

                self.#innings = parseInt(nbInningsElement.textContent);

            }

        }

    }

}
