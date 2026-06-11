
import Phaser from "phaser";
import type {
    Question,
    QuestionComponent,
    AnswerComponent
} from "../model/Question";

import { ClockComponent } from "../components/ClockComponent";
import { Shop } from "../Shop";

export class PenaltyScene extends Phaser.Scene {
    public score = 0;
    public message!: Phaser.GameObjects.Text;
    public scoreText!: Phaser.GameObjects.Text;
    public keeper!: Phaser.GameObjects.Image;
    private isShooting = false;
    private ball!: Phaser.GameObjects.Image;
    private currentQuestion!: Question;
    private targets = [
        { letter: "A", x: 330, y: 210 },
        { letter: "B", x: 512, y: 190 },
        { letter: "C", x: 694, y: 210 },
        { letter: "D", x: 330, y: 320 },
        { letter: "E", x: 694, y: 320 }];
    private questionText!: Phaser.GameObjects.Text;
    private answerTexts: Phaser.GameObjects.Text[] = [];
    private glove!: Phaser.GameObjects.Image;
    private miniBall!: Phaser.GameObjects.Image;

    private gloveAngle = Math.PI;
    private gloveDirection = -1;

    private miniGameRunning = false;
    private targetCircles: Phaser.GameObjects.Arc[] = [];
    private targetTexts: Phaser.GameObjects.Text[] = [];

    private scorePanel!: Phaser.GameObjects.Graphics;

    private questionGraphics: Phaser.GameObjects.Graphics[] = [];

    private clockComponent!: ClockComponent;
    private shop!: Shop;
    private educationalGames=[{title:"Garder le fil",url:"https://learningapps.org/watch?v=p2osnn81c26"}];

    private filteredQuestions: Question[] = [];
    private allQuestions:Question[]=[];
    private categories:string[]=[];
    private selectedCategories:Set<string>=new Set();

    constructor() {
        super("PenaltyScene");
    }

    preload() {
        this.load.image("goal", "assets/goal.png")
        this.load.image("ball", "assets/ball.png");
        this.load.image("miniBall", "assets/ball.png");
        this.load.image("gloves", "assets/gloves.png");
        this.load.image("background", "assets/background.png");
        this.load.image("clock","assets/clock.png");

        this.load.image("keeper_default","assets/keeper_default.png");
        this.load.image("keeper_ronaldo","assets/keepers/ronaldo.png");
        this.load.image("keeper_messi","assets/keepers/messi.png");
        this.load.image("keeper_mbappe","assets/keepers/mbappe.png");
        this.load.image("keeper_doku","assets/keepers/doku.png");
        this.load.image("keeper_debruyne","assets/keepers/debruyne.png");
        this.load.image("keeper_pikachu","assets/keepers/pikachu.png");
        this.load.image("keeper_oscar","assets/keepers/oscar.png");
        this.load.image("keeper_neymar","assets/keepers/neymar.png");
        this.load.image("keeper_courtois","assets/keepers/courtois.png");
    }

    create() {

        this.add.image(512, 400, "background").setScale(0.8);
        
        this.ball = this.add.image(512, 530, "ball").setScale(0.1).setDepth(30);
        this.message = this.add.text(430, 320, "", { fontSize: "80px", color: "#ffdd00", fontFamily: "Impact" })
            .setDepth(50).setFontSize(100)
            .setStroke("#000000", 8);
            
        this.shop = new Shop(this);
        this.keeper = this.add.image(512,300,`keeper_${this.shop.selectedKeeper}`).setScale(0.4).setDepth(20);
        this.loadGame();
        this.createScorePanel();
        this.clockComponent = new ClockComponent(this);
        const gamesButton=this.add.text(960,100,"🎮",{fontSize:"40px"}).setOrigin(0.5).setInteractive({useHandCursor:true});
        gamesButton.on("pointerdown",()=>this.showGamesMenu());
        const shopButton=this.add.text(900,100,"💶",{fontSize:"45px"}).setOrigin(0.5).setInteractive({useHandCursor:true});
        shopButton.on("pointerdown",()=>this.shop.showShop());
        const teacherButton=this.add.text(840,100,"👩‍🏫",{fontSize:"40px"}).setOrigin(0.5).setInteractive({useHandCursor:true});
        teacherButton.on("pointerdown",()=>this.showCategoryMenu());
        const targets = [
            { letter: "A", x: 330, y: 210 },
            { letter: "B", x: 512, y: 190 },
            { letter: "C", x: 694, y: 210 },
            { letter: "D", x: 330, y: 320 },
            { letter: "E", x: 694, y: 320 }
        ];
        targets.forEach((target, index) => { this.createTarget(target.letter, target.x, target.y, index); });
        const questionFiles =import.meta.glob("../../public/data/*.json",{eager:true});
        Object.values(questionFiles).forEach((file:any)=> {this.allQuestions.push(...file.default);});

        //this.allQuestions = [...this.clockquestions,...this.mathquestions,...this.lecturequestions];
        this.categories = [...new Set(this.allQuestions.map(q=>q.category))];
        this.categories.forEach(category=>this.selectedCategories.add(category));
        this.reloadQuestions();
        this.loadNextQuestion();
    }

    public saveGame(){
        localStorage.setItem(
            "footquiz",
            JSON.stringify({
                score:this.score,
                unlockedKeepers:this.shop.unlockedKeepers,
                selectedKeeper:this.shop.selectedKeeper,
                selectedCategories:[...this.selectedCategories]
            })
        );
    }

    public loadGame(){
        const save=
            localStorage.getItem(
                "footquiz"
            );

        if(!save)
        {
            return;
        }

        const data=JSON.parse(save);

        this.score=data.score ?? 0;

        this.shop.unlockedKeepers=data.unlockedKeepers ??["default"];

        this.shop.selectedKeeper=data.selectedKeeper ??"default";
        if(data.selectedCategories) {
            this.selectedCategories=
                new Set(
                    data.selectedCategories
                );
        }
    }

    private reloadQuestions() {
        this.filteredQuestions=
            this.allQuestions.filter(
                q=>
                    this.selectedCategories.has(
                        q.category
                    )
            );
    }

    private showCategoryMenu() {
        const background=this.add.rectangle(
            512,
            384,
            600,
            500,
            0x000000,
            0.9
        )
        .setDepth(300);

        const elements:any[]=[
            background
        ];

        const title=this.add.text(
            512,
            150,
            "Catégories",
            {
                fontSize:"32px",
                color:"#ffffff"
            }
        )
        .setOrigin(0.5)
        .setDepth(301);

        elements.push(title);

        this.categories.forEach(
            (category,index)=>
            {
                const checked=
                    this.selectedCategories.has(
                        category
                    );

                const line=this.add.text(
                    300,
                    220 + index * 50,
                    `${checked ? "☑" : "☐"} ${category}`,
                    {
                        fontSize:"28px",
                        color:"#ffff00"
                    }
                )
                .setInteractive({
                    useHandCursor:true
                })
                .setDepth(301);

                line.on(
                    "pointerdown",
                    ()=>{
                        if(
                            this.selectedCategories.has(
                                category
                            )
                        )
                        {
                            this.selectedCategories.delete(
                                category
                            );
                        }
                        else
                        {
                            this.selectedCategories.add(
                                category
                            );
                        }

                        elements.forEach(
                            e=>e.destroy()
                        );

                        closeButton.destroy();

                        this.showCategoryMenu();
                    }
                );

                elements.push(line);
            }
        );

        const closeButton=this.add.text(
            730,
            150,
            "❌",
            {
                fontSize:"32px"
            }
        )
        .setInteractive({
            useHandCursor:true
        })
        .setDepth(301);

        closeButton.on(
            "pointerdown",
            ()=>{
                this.reloadQuestions();

                if(this.filteredQuestions.length===0)
                {
                    this.filteredQuestions=
                        [...this.allQuestions];
                }

                elements.forEach(
                    e=>e.destroy()
                );

                closeButton.destroy();
            }
        );
    }

    private createScorePanel() {
        this.scorePanel = this.add.graphics();
        this.scorePanel.fillStyle(0x000000,0.8);
        this.scorePanel.lineStyle(3,0xffffff,1);
        this.scorePanel.fillRoundedRect(760,20,240,70,15);
        this.scorePanel.strokeRoundedRect(760,20,240,70,15);

        // Coupe
        this.add.text(780,30,"🏆",{fontSize: "30px", padding: { top: 10 }});

        // Score
        this.scoreText =
            this.add.text(830,35,`${this.score} pts`,
                {
                    fontFamily: "Verdana",
                    fontSize: "28px",
                    color: "#ffff00",
                    fontStyle: "bold"
                }
            );
    }

    private addScore(points: number) {

        this.showFloatingPoints(points, 850, 100);

        this.score += points;

        this.scoreText.setText(`${this.score} pts`);
        this.saveGame();

        // petit effet visuel
        this.tweens.add({
            targets: this.scoreText,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 150,
            yoyo: true
        });
    }

    private loadNextQuestion() {
        // Nombre minimum de fois posée
        const minAsked = Math.min(...this.filteredQuestions.map(q => q.asked));

        // Questions candidates
        const candidates = this.filteredQuestions.filter(q => q.asked === minAsked);

        // Tirage au hasard
        const question = Phaser.Utils.Array.GetRandom(candidates) as Question;

        // Incrément du compteur
        question.asked++;

        // Affichage
        this.showQuestion(question);
    }

    private createTarget(
        letter: string,
        x: number,
        y: number,
        answerIndex: number) {

        // Cercle cible
        const circle = this.add.circle(
            x,
            y,
            32,
            0xffd700,
            0.9
        )
            .setStrokeStyle(3, 0x000000)
            .setInteractive({ useHandCursor: true })
            .setDepth(10);
        this.targetCircles.push(circle);

        // Lettre au centre
        const text = this.add.text(
            x,
            y,
            letter,
            {
                fontFamily: "Verdana",
                fontSize: "28px",
                color: "#000000",
                fontStyle: "bold"
            }
        )
            .setOrigin(0.5)
            .setDepth(11);

        this.targetTexts.push(text);

        // Effet hover souris
        circle.on("pointerover", () => { circle.setScale(1.15); });
        circle.on("pointerout", () => { circle.setScale(1); });

        // Clic
        circle.on("pointerdown", () => { if (this.isShooting) { return; } this.answerSelected(answerIndex); });
    }

    private showQuestion(question:Question) {
        this.questionGraphics.forEach(g=>g.destroy());
        this.questionGraphics=[];
        if(this.questionText) this.questionText.destroy();

        this.answerTexts.forEach(txt=>txt.destroy());
        this.answerTexts=[];

        this.currentQuestion=question;

        const questionPanel=this.add.rectangle(515,665,1000,205,0x0f1b3d,0.9);
        questionPanel.setStrokeStyle(4,0xffd700);

        this.showQuestionComponent(question.question);
        this.showAnswerComponent(question.answer);
    }

    private showQuestionComponent(question:QuestionComponent) {
        switch(question.component) {
            case "text":
                this.showTextQuestion(question);
                break;

            case "clockText":
                this.showClockTextQuestion(question);
                break;

            case "clockDrawing":
                this.showClockDrawingQuestion(question);
                break;
            case "timeDisplay":
                this.showTimeDisplayQuestion(question);
                break;

            default:
                console.error("Question component inconnu",question);
        }
    }

    private showClockTextQuestion(question:any) {
        const txt=
            `${question.hour}h${question.minute
                .toString()
                .padStart(2,"0")}`;

        this.questionText=this.add.text(
            512,
            620,
            txt,
            {
                fontFamily:"Verdana",
                fontSize:"60px",
                color:"#ffffff",
                fontStyle:"bold"
            }
        ).setOrigin(0.5);
    }

    private showClockDrawingQuestion(question:any) {
        this.clockComponent.showClock(512, 620, question.hour, question.minute);
    }

    private showTimeDisplayQuestion(question:any)
    {
        const hh=
            question.hour
            .toString()
            .padStart(2,"0");

        const mm=
            question.minute
            .toString()
            .padStart(2,"0");

        this.questionText=this.add.text(
            512,
            620,
            `${hh}:${mm}`,
            {
                fontSize:"72px",
                color:"#ffffff"
            }
        ).setOrigin(0.5);
    }

    private validateTimePicker(){
        const success =
            this.clockComponent.getTimePickerHour() === this.clockComponent.getClockHour()
            && this.clockComponent.getTimePickerMinute() === this.clockComponent.getClockMinute();

        if(success)
        {
            this.addScore(25);
            this.message.setText("⭐️ BRAVO ⭐️");
        }
        else
        {
            this.message.setText("😬 RATÉ 😬");
        }

        this.time.delayedCall(
            1500,
            ()=>{
                this.message.setText("");
                this.clockComponent.destroyTimePicker();
                this.clockComponent.destroy();
                this.loadNextQuestion();
            }
        );
    }

    private showAnswerComponent(answer:AnswerComponent){
        switch(answer.component)
        {
            case "multipleChoice":
                this.showMultipleChoiceAnswer(answer);
                break;

            case "timePicker":
                this.showTimePickerAnswer();
                break;

        }
    }

    private showTimePickerAnswer() {
        this.clockComponent.showTimePicker(
            ()=>this.validateTimePicker())
            ;    
    }

    private showTextQuestion(question:any) {
        this.questionText=this.add.text(
            512,
            600,
            question.text,
            {
                fontFamily:"Verdana",
                fontSize:"24px",
                color:"#ffffff",
                fontStyle:"bold",
                align:"center",
                wordWrap:{width:800}
            }
        ).setOrigin(0.5);
    }

    private showMultipleChoiceAnswer(answer:any) {
        const style={
            fontFamily:"ARIAL",
            fontSize:"20px",
            color:"#ffff88",
            stroke:"#000000",
            strokeThickness:4
        };

        this.answerTexts.push(this.add.text(50,620,"A) "+answer.answers[0],style));
        this.answerTexts.push(this.add.text(50,650,"B) "+answer.answers[1],style));
        this.answerTexts.push(this.add.text(50,680,"C) "+answer.answers[2],style));
        this.answerTexts.push(this.add.text(50,710,"D) "+answer.answers[3],style));
        this.answerTexts.push(this.add.text(50,740,"E) "+answer.answers[4],style));
    }

    private answerSelected(answerIndex: number) {

        if (this.isShooting) {
            return;
        }

        if(this.currentQuestion.answer.component !== "multipleChoice") {
            console.error("answerSelected appelé pour un type de réponse non QCM");
        return;
        }

        const success = answerIndex === this.currentQuestion.answer.correct;

        // bonne réponse
        if (success) {

            const possibleTargets =
                [0, 1, 2, 3, 4]
                    .filter(
                        i => i !== answerIndex
                    );

            const keeperTarget =
                Phaser.Utils.Array.GetRandom(
                    possibleTargets
                );

            this.shoot(
                answerIndex,
                keeperTarget
            );
        } else {
            // mauvaise réponse
            this.shoot(
                answerIndex,
                answerIndex
            );
        }
    }

    private shoot(ballTargetIndex: number, keeperTargetIndex: number) {

        this.isShooting = true;

        const ballTarget =
            this.targets[ballTargetIndex];

        const keeperTarget =
            this.targets[keeperTargetIndex];

        //
        // Déplacement du gardien
        //
        this.tweens.add({
            targets: this.keeper,

            x: keeperTarget.x,
            y: keeperTarget.y,

            duration: 300,

            ease: "Quad.easeOut"
        });

        //
        // Tir du ballon
        //
        this.tweens.add({
            targets: this.ball,

            x: ballTarget.x,
            y: ballTarget.y,

            scaleX: 0.05,
            scaleY: 0.05,

            angle: 720,

            duration: 800,

            ease: "Quad.easeOut",

            onComplete: () => {

                const saved =
                    ballTargetIndex === keeperTargetIndex;

                if (!saved) {
                    this.addScore(25);
                }
                this.message.setText(
                    saved
                        ? "😬 RATÉ ! 😬"
                        : "⭐️ GOAL !!! ⭐️"
                ).setX(saved ? 280 : 300);

                this.message.setScale(0);

                this.tweens.add({
                    targets: this.message,
                    scale: 1,
                    duration: 250,
                    ease: "Back.Out"
                });

                this.time.delayedCall(
                    1200,
                    () => {

                        this.ball.setPosition(
                            512,
                            530
                        );

                        this.ball.setScale(
                            0.1
                        );

                        this.ball.setAngle(
                            0
                        );

                        this.keeper.setPosition(
                            512,
                            300
                        );

                        this.message.setText("");

                        this.isShooting = false;

                        this.startKeeperMiniGame();
                    }
                );
            }
        });
    }

    private startKeeperMiniGame() {
        const centerX = 512;
        const centerY = 360;
        const radius = 180;

        this.miniGameRunning = true;
        this.hideTargets();

        //
        // Création des sprites
        //
        this.glove = this.add
            .image(centerX, centerY, "gloves")
            .setScale(0.05)
            .setDepth(40);

        this.miniBall = this.add
            .image(centerX, centerY, "miniBall")
            .setScale(0.1)
            .setDepth(40);

        //
        // Position aléatoire du ballon
        //
        const targetAngle =
            Phaser.Math.FloatBetween(
                0.3,
                Math.PI - 0.3
            );

        this.miniBall.x =
            centerX +
            Math.cos(targetAngle)
            * radius;

        this.miniBall.y =
            centerY -
            Math.sin(targetAngle)
            * radius;

        //
        // Gants au départ à gauche
        //
        this.gloveAngle = Math.PI;
        this.gloveDirection = -1;

        this.input.once(
            "pointerdown",
            () => this.validateKeeperMiniGame()
        );
    }

    update() {
        if (!this.miniGameRunning) {
            return;
        }

        const centerX = 512;
        const centerY = 360;

        const radius = 180;

        //
        // Mouvement sur demi-cercle
        //
        this.gloveAngle +=
            0.03 * this.gloveDirection;

        //
        // Rebond à droite
        //
        if (this.gloveAngle <= 0) {
            this.gloveAngle = 0;
            this.gloveDirection = 1;
        }

        //
        // Rebond à gauche
        //
        if (this.gloveAngle >= Math.PI) {
            this.gloveAngle = Math.PI;
            this.gloveDirection = -1;
        }

        //
        // Position des gants
        //
        this.glove.x =
            centerX +
            Math.cos(this.gloveAngle)
            * radius;

        this.glove.y =
            centerY -
            Math.sin(this.gloveAngle)
            * radius;
    }

    private validateKeeperMiniGame() {
        const distance =
            Phaser.Math.Distance.Between(
                this.glove.x,
                this.glove.y,
                this.miniBall.x,
                this.miniBall.y
            );

        const success =
            distance < 50;

        if (success) {
            this.addScore(10);
        }

        this.message.setText(
            success
                ? "🤩 SUPER ARRET ! 🤩"
                : "🙊 Raté ! 🙊"
        ).setX(success ? 180 : 300);

        this.glove.destroy();
        this.miniBall.destroy();

        this.miniGameRunning = false;

        this.time.delayedCall(
            1200,
            () => {

                this.message.setText("");
                this.showTargets();
                this.loadNextQuestion();

            }
        );
    }

    private showTargets() {
        this.targetCircles.forEach(
            target => {
                target.setVisible(true);
                target.setInteractive({
                    useHandCursor: true
                });
            }
        );

        this.targetTexts.forEach(
            text => text.setVisible(true)
        );
    }

    private hideTargets() {
        this.targetCircles.forEach(
            target => {
                target.setVisible(false);
                target.disableInteractive();
            }
        );

        this.targetTexts.forEach(
            text => text.setVisible(false)
        );
    }

    private showFloatingPoints(points: number, x: number, y: number) {
        const txt = this.add.text(x, y, `+${points}`, {
            fontFamily: "Verdana",
            fontSize: "36px",
            color: "#00ff00",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 4
        }).setDepth(100);

        this.tweens.add({
            targets: txt,
            y: y - 80,
            alpha: 0,
            duration: 1000,
            ease: "Quad.easeOut",
            onComplete: () => {
                txt.destroy();
            }
        });
    }

    private showGamesMenu(){
        const background=this.add.rectangle(
            512,
            384,
            700,
            500,
            0x000000,
            0.9
        )
        .setDepth(200);

        const title=this.add.text(
            512,
            170,
            "Mini-jeux",
            {
                fontSize:"36px",
                color:"#ffffff"
            }
        )
        .setOrigin(0.5)
        .setDepth(201);

        const elements:any[]=[
            background,
            title
        ];

        this.educationalGames.forEach(
            (game,index)=>
            {
                const link=this.add.text(
                    250,
                    250 + index * 60,
                    game.title,
                    {
                        fontSize:"28px",
                        color:"#ffff00"
                    }
                )
                .setInteractive({useHandCursor:true})
                .setDepth(201);

                link.on(
                    "pointerdown",
                    ()=>{
                        window.open(
                            game.url,
                            "_blank"
                        );

                        this.addScore(300);

                        elements.forEach(
                            e=>e.destroy()
                        );

                        link.destroy();
                        closeButton.destroy();
                    }
                );

                elements.push(link);
            }
        );

        const closeButton=this.add.text(
            760,
            170,
            "❌",
            {
                fontSize:"32px"
            }
        )
        .setInteractive({useHandCursor:true})
        .setDepth(201);

        closeButton.on(
            "pointerdown",
            ()=>{
                elements.forEach(
                    e=>e.destroy()
                );

                closeButton.destroy();
            }
        );
    }

}
