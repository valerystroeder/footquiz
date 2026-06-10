import Phaser from "phaser";

export class ClockComponent {

    private scene: Phaser.Scene;

    private clockFace!: Phaser.GameObjects.Image;
    private hourHand!: Phaser.GameObjects.Graphics;
    private minuteHand!: Phaser.GameObjects.Graphics;
    private hour!: number;
    private minute!: number;

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
        this.hour = hour;
        this.minute = minute;   
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

    public getHour():number
    {
        return this.hour;
    }

    public getMinute():number
    {
        return this.minute;
    }

    public destroy()
    {
        this.clockFace?.destroy();
        this.hourHand?.destroy();
        this.minuteHand?.destroy();
    }
}