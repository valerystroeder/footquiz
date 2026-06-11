import type { PenaltyScene } from "../scenes/PenaltyScene";

export class Shop {
    
    private scene: PenaltyScene;
    
    public keeper!: Phaser.GameObjects.Image;
    public unlockedKeepers:string[]=["default"];
    public selectedKeeper="default";
    
    shopItems=[
    {
        id:"ronaldo",
        name:"Ronaldo",
        price:500
    },
    {
        id:"messi",
        name:"Messi",
        price:500
    },
    {
        id:"mbappe",
        name:"Mbappé",
        price:500
    },
    {
        id:"doku",
        name:"Doku",
        price:500
    },
    {
        id:"debruyne",
        name:"De Bruyne",
        price:500
    },
    {
        id:"pikachu",
        name:"Pikachu",
        price:500
    },
    {
        id:"courtois",
        name:"Courtois",
        price:500
    },
    {
        id:"neymar",
        name:"Neymar",
        price:500
    },
    {
        id:"oscar",
        name:"Oscar",
        price:500
    }];

    constructor(scene: PenaltyScene) {
        this.scene = scene;
    }

    create() {
        
        this.keeper= this.scene.add.image(512,300,`keeper_${this.selectedKeeper}`).setScale(0.4).setDepth(20);
    }

    public showShop() {
        const background=this.scene.add.rectangle(
            512,
            384,
            700,
            550,
            0x000000,
            0.9
        ).setDepth(200);

        const elements:any[]=[
            background
        ];

        this.shopItems.forEach(
            (item,index)=>
            {
                const owned=
                    this.unlockedKeepers.includes(
                        item.id
                    );

                const text=
                    owned
                    ? `✅ ${item.name}`
                    : `${item.name} - ${item.price} pts`;

                const line=this.scene.add.text(
                    250,
                    150 + index * 50,
                    text,
                    {
                        fontSize:"28px",
                        color:"#ffff00"
                    }
                )
                .setDepth(201)
                .setInteractive({
                    useHandCursor:true
                });

                line.on(
                    "pointerdown",
                    ()=>{
                        this.buyKeeper(item);
                    }
                );

                elements.push(line);
            }
        );

        const close=this.scene.add.text(760,120,"❌",{fontSize:"32px"}).setDepth(201).setInteractive();

        close.on("pointerdown",()=>{
                elements.forEach(
                    e=>e.destroy()
                );
                close.destroy();
            });
        }

        public buyKeeper(item:any) {
        const alreadyOwned=
            this.unlockedKeepers.includes(
                item.id
            );

        if(alreadyOwned)
        {
            this.selectedKeeper=item.id;

            this.updateKeeperSprite();

            this.scene.saveGame();

            return;
        }

        if(this.scene.score < item.price){
            this.scene.message.setText("Pas assez de points");
            return;
        }

        this.scene.score -= item.price;

        this.scene.scoreText.setText(
            `${this.scene.score} pts`
        );

        this.unlockedKeepers.push(
            item.id
        );

        this.selectedKeeper=
            item.id;

        this.updateKeeperSprite();

        this.scene.saveGame();
        
    }

    private updateKeeperSprite(){
        this.scene.keeper.setTexture(`keeper_${this.selectedKeeper}`);
    }
}