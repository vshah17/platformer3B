class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 500;
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
    }

    create() {
        // Create a new tilemap game object
        this.map = this.add.tilemap("platformer-level-1");

        // Add a tileset to the map
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({ collides: true });

        // Create coins from objects
        this.coins = this.map.createFromObjects("Objects", { name: "coin", key: "tilemap_sheet", frame: 151 });

        // Enable physics for coins
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);

        // Set up player avatar
        this.player = this.physics.add.sprite(30, 345, "platformer_characters", "tile_0000.png");
        this.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(this.player, this.groundLayer);

        // Handle coin collection
        this.physics.add.overlap(this.player, this.coinGroup, (player, coin) => {
            coin.destroy(); // Remove coin on overlap
            // Play sound effect here if needed
        });

        // Set up input keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');

        // Set up particle effects
        this.particles = this.add.particles('kenny-particles');
        this.walkingParticles = this.particles.createEmitter({
            frame: ['smoke_03.png', 'smoke_09.png'],
            scale: { start: 0.03, end: 0.1 },
            lifespan: 350,
            alpha: { start: 1, end: 0.1 },
            on: false
        });

        // Camera setup
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        // Add audio effects
        this.jumpSound = this.sound.add('jump');
        this.collectSound = this.sound.add('collect');
    }

    update() {
        // Player movement
        if (this.cursors.left.isDown) {
            this.player.setAccelerationX(-this.ACCELERATION);
            this.player.resetFlip();
            this.player.anims.play('walk', true);
            this.walkingParticles.startFollow(this.player);

            if (this.player.body.blocked.down) {
                this.walkingParticles.start();
            }
        } else if (this.cursors.right.isDown) {
            this.player.setAccelerationX(this.ACCELERATION);
            this.player.setFlip(true, false);
            this.player.anims.play('walk', true);
            this.walkingParticles.startFollow(this.player);

            if (this.player.body.blocked.down) {
                this.walkingParticles.start();
            }
        } else {
            this.player.setAccelerationX(0);
            this.player.setDragX(this.DRAG);
            this.player.anims.play('idle');
            this.walkingParticles.stop();
        }

        // Player jump
        if (!this.player.body.blocked.down) {
            this.player.anims.play('jump');
        }
        if (this.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.jumpSound.play();
        }

        // Restart game
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}

export default Platformer;
