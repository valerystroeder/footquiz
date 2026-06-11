import Phaser from "phaser";

export class CategoryMenu {

    private scene: Phaser.Scene;
    private categories: string[];
    private selectedCategories: Set<string>;
    private onValidate: () => void;

    private page = 0;
    private readonly categoriesPerPage = 8;

    private elements: Phaser.GameObjects.GameObject[] = [];

    constructor(
        scene: Phaser.Scene,
        categories: string[],
        selectedCategories: Set<string>,
        onValidate: () => void
    ) {
        this.scene = scene;
        this.categories = categories;
        this.selectedCategories = selectedCategories;
        this.onValidate = onValidate;
    }

    public show() {

        this.destroy();

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    this.categories.length /
                    this.categoriesPerPage
                )
            );

        if (this.page >= totalPages) {
            this.page = totalPages - 1;
        }

        const background =
            this.scene.add.rectangle(
                512,
                384,
                600,
                500,
                0x000000,
                0.9
            )
            .setDepth(300);

        this.elements.push(background);

        const title =
            this.scene.add.text(
                512,
                150,
                "Catégories",
                {
                    fontSize: "32px",
                    color: "#ffffff"
                }
            )
            .setOrigin(0.5)
            .setDepth(301);

        this.elements.push(title);

        const pageText =
            this.scene.add.text(
                512,
                190,
                `Page ${this.page + 1}/${totalPages}`,
                {
                    fontSize: "20px",
                    color: "#cccccc"
                }
            )
            .setOrigin(0.5)
            .setDepth(301);

        this.elements.push(pageText);

        const toggleAllButton =
            this.scene.add.text(
                512,
                220,
                "☑ Tout cocher / décocher",
                {
                    fontSize: "24px",
                    color: "#00ffcc"
                }
            )
            .setOrigin(0.5)
            .setDepth(301)
            .setInteractive({
                useHandCursor: true
            });

        toggleAllButton.on(
            "pointerdown",
            () => {

                const allSelected =
                    this.categories.every(
                        category =>
                            this.selectedCategories.has(
                                category
                            )
                    );

                if (allSelected) {

                    this.selectedCategories.clear();

                } else {

                    this.categories.forEach(
                        category =>
                            this.selectedCategories.add(
                                category
                            )
                    );
                }

                this.show();
            }
        );

        this.elements.push(toggleAllButton);

        const start =
            this.page *
            this.categoriesPerPage;

        const visibleCategories =
            this.categories.slice(
                start,
                start + this.categoriesPerPage
            );

        visibleCategories.forEach(
            (category, index) => {

                const checked =
                    this.selectedCategories.has(
                        category
                    );

                const line =
                    this.scene.add.text(
                        280,
                        280 + index * 40,
                        `${checked ? "☑" : "☐"} ${category}`,
                        {
                            fontSize: "26px",
                            color: "#ffff00"
                        }
                    )
                    .setDepth(301)
                    .setInteractive({
                        useHandCursor: true
                    });

                line.on(
                    "pointerdown",
                    () => {

                        if (
                            this.selectedCategories.has(
                                category
                            )
                        ) {
                            this.selectedCategories.delete(
                                category
                            );
                        }
                        else {
                            this.selectedCategories.add(
                                category
                            );
                        }

                        this.show();
                    }
                );

                this.elements.push(line);
            }
        );

        const upButton =
            this.scene.add.text(
                720,
                290,
                "▲",
                {
                    fontSize: "36px",
                    color: "#ffffff"
                }
            )
            .setDepth(301)
            .setInteractive({
                useHandCursor: true
            });

        upButton.on(
            "pointerdown",
            () => {

                if (this.page > 0) {
                    this.page--;
                    this.show();
                }
            }
        );

        this.elements.push(upButton);

        const downButton =
            this.scene.add.text(
                720,
                290 + this.categoriesPerPage * 40,
                "▼",
                {
                    fontSize: "36px",
                    color: "#ffffff"
                }
            )
            .setDepth(301)
            .setInteractive({
                useHandCursor: true
            });

        downButton.on(
            "pointerdown",
            () => {

                if (
                    this.page <
                    totalPages - 1
                ) {
                    this.page++;
                    this.show();
                }
            }
        );

        this.elements.push(downButton);

        const closeButton =
            this.scene.add.text(
                740,
                150,
                "❌",
                {
                    fontSize: "32px"
                }
            )
            .setDepth(301)
            .setInteractive({
                useHandCursor: true
            });

        closeButton.on(
            "pointerdown",
            () => {

                this.destroy();

                this.onValidate();
            }
        );

        this.elements.push(closeButton);
    }

    public destroy() {

        this.elements.forEach(
            element => element.destroy()
        );

        this.elements = [];
    }
}