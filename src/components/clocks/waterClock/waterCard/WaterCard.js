import React, { useRef, useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { TweenMax, Linear } from 'gsap';
import './WaterCard.css';

export default function WaterCard() {
  const canvasRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    (async () => {
      const baseUrl = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/106114/";
      const vw = 630;
      const vh = 410;

      if (!PIXI || !TweenMax || !Linear) return;

      const app = new PIXI.Application({
        width: vw,
        height: vh,
        view: canvasRef.current,
        backgroundColor: 0x222222,
      });
      appRef.current = app;

      const onDragStart = function(event) {
        this.data = event.data;
        this.lastPosition = this.data.getLocalPosition(this.parent);
      };
      const onDragMove = function() {
        if (this.lastPosition) {
          const newPosition = this.data.getLocalPosition(this.parent);
          this.position.x += (newPosition.x - this.lastPosition.x);
          this.position.y += (newPosition.y - this.lastPosition.y);
          this.lastPosition = newPosition;
        }
      };
      const onDragEnd = function() {
        this.data = null;
        this.lastPosition = null;
      };

      // Loader adaptado para pixi.js v6+ usando PIXI.Assets
      const urls = [
        baseUrl + "displacementmap2.png?v=1",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/300px-PNG_transparency_demonstration_1.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/300px-PNG_transparency_demonstration_1.png"
      ];
      // Carga cada asset individualmente y espera a que esté listo
      let displacementMapTexture, rocksTexture, fishTexture;
      try {
        displacementMapTexture = await PIXI.Assets.load(urls[0]);
        rocksTexture = await PIXI.Assets.load(urls[1]);
        fishTexture = await PIXI.Assets.load(urls[2]);
      } catch (err) {
        // Si falla la carga, muestra fondo de color
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0x4444aa);
        graphics.drawRect(0, 0, vw, vh);
        graphics.endFill();
        app.stage.addChild(graphics);
        return;
      }

      // Si el asset es un objeto, usa la propiedad .texture
      const getTexture = (asset) => asset && asset.texture ? asset.texture : asset;

      const container = new PIXI.Container();
      const background = new PIXI.Sprite(getTexture(rocksTexture));
      background.x = 0;
      background.y = 0;
      background.width = vw;
      background.height = vh;

      const fish = new PIXI.Sprite(getTexture(fishTexture));
      fish.x = 200;
      fish.y = 100;
      fish.width = 100;
      fish.height = 100;
      fish.interactive = true;
      fish.buttonMode = true;

      fish
        .on("pointerdown", onDragStart)
        .on("pointerup", onDragEnd)
        .on("pointerupoutside", onDragEnd)
        .on("pointermove", onDragMove);

      // Quitar displacementSprite y displacementFilter para depuración
      container.position.set(0, 0);
      // Fondo de depuración
      const debugBg = new PIXI.Graphics();
      debugBg.beginFill(0x4444aa, 0.2);
      debugBg.drawRect(0, 0, vw, vh);
      debugBg.endFill();
      container.addChild(debugBg);

      container.addChild(background);
      container.addChild(fish);
      if (app && app.stage) {
        app.stage.addChild(container);
      }
    })();

    // Limpieza al desmontar
    return () => {
      if (appRef.current && typeof appRef.current.destroy === 'function') {
        try {
          appRef.current.destroy(true, { children: true });
        } catch (e) {
          // Si ya está destruido, ignorar el error
        }
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div className="water-card">
      <canvas ref={canvasRef} id="water-canvas" width={630} height={410} />
    </div>
  );
}