import Phaser from "phaser";

export class ClockComponent {

    private scene: Phaser.Scene;

    private clockFace!: Phaser.GameObjects.Image;
    private hourHand!: Phaser.GameObjects.Graphics;
    private minuteHand!: Phaser.GameObjects.Graphics;
    private clockHour!: number;
    private clockMinute!: number;
    private timePickerHour = 12;
    private timePickerMinute = 0;
    private hourText!: Phaser.GameObjects.Text;
    private minuteText!: Phaser.GameObjects.Text;
    private hourMinus!: Phaser.GameObjects.Text;
    private hourPlus!: Phaser.GameObjects.Text;
    private minuteMinus!: Phaser.GameObjects.Text;
    private minutePlus!: Phaser.GameObjects.Text;
    private validateButton!: Phaser.GameObjects.Image;


    constructor(scene: Phaser.Scene)
    {
        this.scene = scene;
    }

    public showClock(
        x:number,
        y:number,
        hour:number,
        minute:number
    )
    {
        this.clockHour = hour;
        this.clockMinute = minute;   
        this.clockFace =
            this.scene.add.image(
                x,
                y,
                "clock"
            )
            .setScale(0.1);

        const minuteAngle =
            (minute / 60)
            * Math.PI * 2
            - Math.PI / 2;

        const hourAngle =
            ((hour % 12)
            + minute / 60)
            * (Math.PI / 6)
            - Math.PI / 2;

        this.hourHand =
            this.scene.add.graphics();

        this.hourHand.lineStyle(
            6,
            0xff0000,
            1
        );

        this.hourHand.lineBetween(
            x,
            y,
            x + Math.cos(hourAngle) * 35,
            y + Math.sin(hourAngle) * 35
        );

        this.minuteHand =
            this.scene.add.graphics();

        this.minuteHand.lineStyle(
            4,
            0x0000ff,
            1
        );

        this.minuteHand.lineBetween(
            x,
            y,
            x + Math.cos(minuteAngle) * 55,
            y + Math.sin(minuteAngle) * 55
        );
    }

    public showTimePicker(onValidate:()=>void) {
        this.destroyTimePicker();
        this.timePickerHour=12;
        this.timePickerMinute=0;

        this.hourMinus=this.scene.add.text(
            320,
            690,
            "◀",
            {
                fontSize:"48px",
                color:"#ffff00"
            }
        )
        .setInteractive();

        this.hourText=this.scene.add.text(
            390,
            690,
            "12",
            {
                fontSize:"48px",
                color:"#ffffff"
            }
        );

        this.hourPlus=this.scene.add.text(
            470,
            690,
            "▶",
            {
                fontSize:"48px",
                color:"#ffff00"
            }
        )
        .setInteractive();

        this.scene.add.text(
            540,
            690,
            ":",
            {
                fontSize:"48px",
                color:"#ffffff"
            }
        );

        this.minuteMinus=this.scene.add.text(
            590,
            690,
            "◀",
            {
                fontSize:"48px",
                color:"#ffff00"
            }
        )
        .setInteractive();

        this.minuteText=this.scene.add.text(
            660,
            690,
            "00",
            {
                fontSize:"48px",
                color:"#ffffff"
            }
        );

        this.minutePlus=this.scene.add.text(
            740,
            690,
            "▶",
            {
                fontSize:"48px",
                color:"#ffff00"
            }
        )
        .setInteractive();

        this.hourMinus.on(
            "pointerdown",
            ()=>this.changeHour(-1)
        );

        this.hourPlus.on(
            "pointerdown",
            ()=>this.changeHour(1)
        );

        this.minuteMinus.on(
            "pointerdown",
            ()=>this.changeMinute(-5)
        );

        this.minutePlus.on(
            "pointerdown",
            ()=>this.changeMinute(5)
        );

        this.validateButton=
            this.scene.add.image(
                900,
                710,
                "ball"
            )
            .setScale(0.1)
            .setInteractive();

        this.validateButton.on(
            "pointerdown",
            onValidate
        );
    }

    private changeHour(delta:number) {
        this.timePickerHour+=delta;

        if(this.timePickerHour<0) this.timePickerHour=23;
        if(this.timePickerHour>23) this.timePickerHour=0;

        this.hourText.setText(
            this.timePickerHour.toString().padStart(2,"0")
        );
    }

    private changeMinute(delta:number){
        this.timePickerMinute+=delta;

        if(this.timePickerMinute<0) this.timePickerMinute=55;
        if(this.timePickerMinute>55) this.timePickerMinute=0;

        this.minuteText.setText(
            this.timePickerMinute.toString().padStart(2,"0")
        );
    }

    public getTimePickerHour():number
    {
        return this.timePickerHour;
    }

    public getTimePickerMinute():number
    {
        return this.timePickerMinute;
    }

    public destroyTimePicker()
    {
        this.hourMinus?.destroy();
        this.hourPlus?.destroy();

        this.minuteMinus?.destroy();
        this.minutePlus?.destroy();

        this.hourText?.destroy();
        this.minuteText?.destroy();

        this.validateButton?.destroy();
    }

    public destroy()
    {
        this.clockFace?.destroy();
        this.hourHand?.destroy();
        this.minuteHand?.destroy();
    }

    public getClockHour():number
    {
        return this.clockHour;
    }

    public getClockMinute():number
    {
        return this.clockMinute;
    }
}