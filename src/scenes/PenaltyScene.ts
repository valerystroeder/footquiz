
import Phaser from "phaser";
import type {
    Question,
    QuestionComponent,
    AnswerComponent
} from "../model/Question";

import { ClockComponent } from "../components/ClockComponent";
import type {ClockDrawingQuestionComponent} from "../model/Question";

export class PenaltyScene extends Phaser.Scene {
    //private keeper!: Phaser.GameObjects.Rectangle;
    private isShooting = false;
    private message!: Phaser.GameObjects.Text;
    //private ball!: Phaser.GameObjects.Arc;
    private ball!: Phaser.GameObjects.Image;
    private keeper!: Phaser.GameObjects.Image;
    private currentQuestion!: Question;
    private mathquestions: Question[] = [];
    private clockquestions: Question[] = [];
    private proportquestions: Question[] = [];
    private questions: Question[] = [];
    private targets = [
        { letter: "A", x: 330, y: 210 },
        { letter: "B", x: 512, y: 190 },
        { letter: "C", x: 694, y: 210 },
        { letter: "D", x: 360, y: 320 },
        { letter: "E", x: 664, y: 320 }];
    private questionText!: Phaser.GameObjects.Text;
    private answerTexts: Phaser.GameObjects.Text[] = [];
    private glove!: Phaser.GameObjects.Image;
    private miniBall!: Phaser.GameObjects.Image;

    private gloveAngle = Math.PI;
    private gloveDirection = -1;
    private ballAngle = Math.PI;

    private miniGameRunning = false;
    private targetCircles: Phaser.GameObjects.Arc[] = [];
    private targetTexts: Phaser.GameObjects.Text[] = [];

    private score = 0;

    private scorePanel!: Phaser.GameObjects.Graphics;
    private scoreText!: Phaser.GameObjects.Text;
    private trophyIcon!: Phaser.GameObjects.Text;
    
    private questionGraphics: Phaser.GameObjects.Graphics[] = [];

    private clockComponent!: ClockComponent;

    private selectedHour = 12;
    private selectedMinute = 0;

    private hourText!: Phaser.GameObjects.Text;
    private minuteText!: Phaser.GameObjects.Text;
    private editableHour = 12;
    private editableMinute = 0;

    private editableClock = false;

    private clockCenterX = 512;
    private clockCenterY = 620;

    private validateButton!: Phaser.GameObjects.Image;

    private hourMinus!: Phaser.GameObjects.Text;
    private hourPlus!: Phaser.GameObjects.Text;

    private minuteMinus!: Phaser.GameObjects.Text;
    private minutePlus!: Phaser.GameObjects.Text;


    constructor() {
        super("PenaltyScene");
    }

    preload() {
        this.load.image("goal", "src/assets/goal.png")
        this.load.image("ball", "src/assets/ball.png");
        this.load.image("miniBall", "src/assets/ball.png");
        this.load.image("gloves", "src/assets/gloves.png");
        this.load.image("keeper", "src/assets/keeper.png");
        this.load.image("background", "src/assets/background.png");
        //this.load.audio("champions","assets/sounds/champions.mp3");
        this.load.json("mathquestions", "src/data/mathquestions.json");
        this.load.json("clockquestions", "src/data/clockquestions.json");
        this.load.json("proportquestions", "src/data/proportquestions.json");
        this.load.image("clock","src/assets/clock.png");
    }

    create() {

        //this.sound.play("champions",{loop: true,volume: 0.2});

        //this.add.rectangle(512,384,1024,768,0x3aa655);
        //this.add.rectangle(512,180,500,220,0xffffff).setStrokeStyle(8,0x000000);
        this.add.image(512, 400, "background").setScale(0.8);

        //this.keeper = this.add.rectangle(512,200,40,80,0xffaa00);
        this.keeper = this.add.image(512, 300, "keeper").setScale(0.4).setDepth(20);

        //this.add.circle(512,620,25,0x0000ff);
        //this.ball = this.add.circle(512,540,12,0xffffff).setStrokeStyle(2,0x000000);
        this.ball = this.add.image(512, 530, "ball").setScale(0.1).setDepth(30);

        this.message = this.add.text(430, 320, "", { fontSize: "80px", color: "#ffdd00", fontFamily: "Impact" })
            .setDepth(50).setFontSize(100)
            .setStroke("#000000", 8);;

        this.createScorePanel();

        this.clockComponent = new ClockComponent(this);

        const targets = [
            { letter: "A", x: 330, y: 210 },
            { letter: "B", x: 512, y: 190 },
            { letter: "C", x: 694, y: 210 },
            { letter: "D", x: 360, y: 320 },
            { letter: "E", x: 664, y: 320 }
        ];

        targets.forEach((target, index) => { this.createTarget(target.letter, target.x, target.y, index); });

        this.mathquestions = this.cache.json.get("mathquestions") as Question[];
        this.clockquestions = this.cache.json.get("clockquestions") as Question[];
        this.proportquestions = this.cache.json.get("proportquestions") as Question[];
        this.questions = [...this.clockquestions,...this.mathquestions/*,...this.proportquestions*/];
        this.loadNextQuestion();
    }

    private createScorePanel() {
        this.scorePanel = this.add.graphics();

        this.scorePanel.fillStyle(
            0x000000,
            0.8
        );

        this.scorePanel.lineStyle(
            3,
            0xffffff,
            1
        );

        this.scorePanel.fillRoundedRect(
            760,
            20,
            240,
            70,
            15
        );

        this.scorePanel.strokeRoundedRect(
            760,
            20,
            240,
            70,
            15
        );

        //
        // Coupe
        //
        this.trophyIcon =
            this.add.text(
                780,
                30,
                "🏆",
                {
                    fontSize: "30px"
                }
            );

        //
        // Score
        //
        this.scoreText =
            this.add.text(
                830,
                35,
                "0 pts",
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

        this.scoreText.setText(
            `${this.score} pts`
        );

        //
        // petit effet visuel
        //
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
        const minAsked = Math.min(...this.questions.map(q => q.asked));

        // Questions candidates
        const candidates = this.questions.filter(q => q.asked === minAsked);

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

        const panel=this.add.rectangle(512,680,900,170,0x0f1b3d,0.9);
        panel.setStrokeStyle(4,0xffd700);

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

    private showClockEditorAnswer()
    {
        console.log("clockEditor pas encore implémenté");
    }

    private drawEditableClock() {
      /*  this.clockComponent.showClock(
            this.clockCenterX,
            this.clockCenterY,
            this.editableHour,
            this.editableMinute
        );

        this.clockFace.setInteractive();

        this.clockFace.on(
            "pointerdown",
            (pointer:Phaser.Input.Pointer)=>
            {
                this.clockClicked(pointer);
            }
        );*/
    }

    private clockClicked(pointer:Phaser.Input.Pointer)
    {
        const dx=
            pointer.worldX-
            this.clockCenterX;

        const dy=
            pointer.worldY-
            this.clockCenterY;

        const distance=
            Math.sqrt(dx*dx+dy*dy);

        const angle=
            Math.atan2(dy,dx)+Math.PI/2;

        let normalized=
            angle;

        if(normalized<0)
            normalized+=Math.PI*2;

        //
        // Zone extérieure = minutes
        //
        if(distance>60)
        {
            const minuteIndex=
                Math.round(
                    normalized/
                    (Math.PI*2)
                    *12
                )%12;

            this.editableMinute=
                minuteIndex*5;
        }

        //
        // Zone intérieure = heures
        //
        else
        {
            let hour=
                Math.round(
                    normalized/
                    (Math.PI*2)
                    *12
                );

            if(hour===0)
                hour=12;

            this.editableHour=
                hour;
        }

        this.refreshEditableClock();
    }

    private refreshEditableClock(){
        this.clockComponent.destroy();
        
        /*const minuteAngle=
            (this.editableMinute/60)
            *Math.PI*2
            -Math.PI/2;

        const hourAngle=
            ((this.editableHour%12)/12)
            *Math.PI*2
            +(this.editableMinute/60)
            *(Math.PI/6)
            -Math.PI/2;

        this.hourHand=this.add.line(
            0,
            0,
            this.clockCenterX,
            this.clockCenterY,
            this.clockCenterX+
            Math.cos(hourAngle)*45,
            this.clockCenterY+
            Math.sin(hourAngle)*45,
            0xff0000
        ).setLineWidth(6);

        this.minuteHand=this.add.line(
            0,
            0,
            this.clockCenterX,
            this.clockCenterY,
            this.clockCenterX+
            Math.cos(minuteAngle)*70,
            this.clockCenterY+
            Math.sin(minuteAngle)*70,
            0x0000ff
        ).setLineWidth(4);*/
    }

    private validateClockAnswer() {
        const minuteError=
            Math.abs(
                this.editableMinute-
                this.expectedMinute
            );

        const hourError=
            Math.abs(
                this.editableHour-
                this.expectedHour
            );

        const success=
            minuteError<=5 &&
            hourError<=1;

        if(success)
        {
            this.addScore(25);

            this.message.setText(
                "⭐️ BRAVO ⭐️"
            );
        }
        else
        {
            this.message.setText(
                "😬 ESSAYE ENCORE 😬"
            );
        }

        this.message.setScale(0);

        this.tweens.add({
            targets:this.message,
            scale:1,
            duration:250,
            ease:"Back.Out"
        });

        this.time.delayedCall(
            1500,
            ()=>{
                this.cleanupClockEditor();
                this.loadNextQuestion();
            }
        );
    }

    private cleanupClockEditor() {
        this.clockComponent.destroy();

        if(this.validateButton)
            this.validateButton.destroy();

        this.message.setText("");
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

    private showTimePickerAnswer() {
        this.selectedHour=12;
        this.selectedMinute=0;

        this.hourMinus=this.add.text(320,690,"◀",{fontSize:"48px",color:"#ffff00"})
            .setInteractive({useHandCursor:true});

        this.hourText=this.add.text(390,690,"12",{fontSize:"48px",color:"#ffffff"});

        this.hourPlus=this.add.text(470,690,"▶",{fontSize:"48px",color:"#ffff00"})
            .setInteractive({useHandCursor:true});

        this.add.text(540,690,":",{fontSize:"48px",color:"#ffffff"});

        this.minuteMinus=this.add.text(590,690,"◀",{fontSize:"48px",color:"#ffff00"})
            .setInteractive({useHandCursor:true});

        this.minuteText=this.add.text(660,690,"00",{fontSize:"48px",color:"#ffffff"});

        this.minutePlus=this.add.text(740,690,"▶",{fontSize:"48px",color:"#ffff00"})
            .setInteractive({useHandCursor:true});

        this.hourMinus.on("pointerdown",()=>this.changeHour(-1));
        this.hourPlus.on("pointerdown",()=>this.changeHour(1));

        this.minuteMinus.on("pointerdown",()=>this.changeMinute(-5));
        this.minutePlus.on("pointerdown",()=>this.changeMinute(5));

        this.validateButton=this.add.image(900,710,"ball")
            .setScale(0.1)
            .setInteractive({useHandCursor:true});

        this.validateButton.on(
            "pointerdown",
            ()=>this.validateTimePicker()
        );
    }

    private changeHour(delta:number) {
        this.selectedHour+=delta;

        if(this.selectedHour<0) this.selectedHour=23;
        if(this.selectedHour>23) this.selectedHour=0;

        this.hourText.setText(
            this.selectedHour.toString().padStart(2,"0")
        );
    }

    private changeMinute(delta:number){
        this.selectedMinute+=delta;

        if(this.selectedMinute<0) this.selectedMinute=55;
        if(this.selectedMinute>55) this.selectedMinute=0;

        this.minuteText.setText(
            this.selectedMinute.toString().padStart(2,"0")
        );
    }

    private validateTimePicker(){
        const success=
            this.selectedHour===this.clockComponent.getHour()
            &&
            this.selectedMinute===this.clockComponent.getMinute();

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
                this.cleanupTimePicker();
                this.loadNextQuestion();
            }
        );
    }

    private cleanupTimePicker(){
        this.hourMinus.destroy();
        this.hourPlus.destroy();

        this.minuteMinus.destroy();
        this.minutePlus.destroy();

        this.hourText.destroy();
        this.minuteText.destroy();

        this.validateButton.destroy();

        this.clockComponent.destroy();

        this.message.setText("");
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

        /*case "clockEditor":
            this.showClockEditorAnswer(this.currentQuestion.question);
            break;*/
    }
}

    private showTextQuestion(question:any) {
        this.questionText=this.add.text(
            512,
            620,
            question.text,
            {
                fontFamily:"Verdana",
                fontSize:"42px",
                color:"#ffffff",
                fontStyle:"bold"
            }
        ).setOrigin(0.5);
    }

    private showMultipleChoiceAnswer(answer:any) {
        const style={
            fontFamily:"ARIAL",
            fontSize:"28px",
            color:"#ffff88",
            stroke:"#000000",
            strokeThickness:4
        };

        this.answerTexts.push(this.add.text(220,680,"A) "+answer.answers[0],style));
        this.answerTexts.push(this.add.text(512,680,"B) "+answer.answers[1],style));
        this.answerTexts.push(this.add.text(804,680,"C) "+answer.answers[2],style));
        this.answerTexts.push(this.add.text(350,730,"D) "+answer.answers[3],style));
        this.answerTexts.push(this.add.text(674,730,"E) "+answer.answers[4],style));
    }

    private answerSelected(answerIndex: number) {

        if (this.isShooting) {
            return;
        }

        const clockDrawingQuestion = this.currentQuestion.question as ClockDrawingQuestionComponent;
        const success = this.selectedHour === clockDrawingQuestion.hour && this.selectedMinute === clockDrawingQuestion.minute;

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

    private shoot(
        ballTargetIndex: number,
        keeperTargetIndex: number) {

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
                )
                    .setX(saved ? 280 : 300);

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
                ? "SUPER ARRET !"
                : "BUT ADVERSE !"
        ).setX(success ? 300 : 300);

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

    private showClockReadQuestion(question:any){
        this.expectedHour=question.hour;
        this.expectedMinute=question.minute;

        this.clockComponent.showClock(
            512,
            500,
            question.hour,
            question.minute
        );
    }

}
