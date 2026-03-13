import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { useAppTheme } from "../context/ThemeContext";

export default function TradingViewChart({
  candles,
  maSeries,
  rsiSeries,
  macdLine,
  macdSignal,
  macdHistogram,
  showMA,
  showRSI,
  showMACD,
  showVolume,
}) {
  const { isLight, palette } = useAppTheme();
  const html = useMemo(() => {
    const chartTheme = isLight
      ? {
          background: "#ffffff",
          text: "#334155",
          border: "#cbd5e1",
          grid: "#e2e8f0",
          scaleBorder: "#cbd5e1",
          volume: "#94a3b8",
          rsi: "#2563eb",
          overLine: "#94a3b8",
        }
      : {
          background: "#0b1220",
          text: "#cbd5e1",
          border: "#1e293b",
          grid: "#1e293b",
          scaleBorder: "#334155",
          volume: "#64748b",
          rsi: "#60a5fa",
          overLine: "#64748b",
        };

    const payload = {
      candles: Array.isArray(candles) ? candles : [],
      ma: Array.isArray(maSeries) ? maSeries : [],
      rsi: Array.isArray(rsiSeries) ? rsiSeries : [],
      macdLine: Array.isArray(macdLine) ? macdLine : [],
      macdSignal: Array.isArray(macdSignal) ? macdSignal : [],
      macdHistogram: Array.isArray(macdHistogram) ? macdHistogram : [],
      showMA: Boolean(showMA),
      showRSI: Boolean(showRSI),
      showMACD: Boolean(showMACD),
      showVolume: Boolean(showVolume),
      theme: chartTheme,
    };

    return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <script src="https://unpkg.com/lightweight-charts@4.2.3/dist/lightweight-charts.standalone.production.js"></script>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: ${chartTheme.background};
        color: ${chartTheme.text};
        overflow: hidden;
        overscroll-behavior: none;
        touch-action: none;
        -webkit-user-select: none;
        user-select: none;
      }
      #wrap { width: 100%; height: 100%; display: grid; grid-template-rows: var(--main-h) var(--ind-h); gap: 8px; box-sizing: border-box; padding: 8px; }
      #main, #ind { width: 100%; height: 100%; border: 1px solid ${chartTheme.border}; border-radius: 8px; overflow: hidden; }
    </style>
  </head>
  <body>
    <div id="wrap">
      <div id="main"></div>
      <div id="ind"></div>
    </div>
    <script>
      const p = ${JSON.stringify(payload)};
      const hasIndicatorPane = p.showRSI || p.showMACD;
      document.documentElement.style.setProperty("--main-h", hasIndicatorPane ? "68%" : "100%");
      document.documentElement.style.setProperty("--ind-h", hasIndicatorPane ? "32%" : "0%");
      const indEl = document.getElementById("ind");
      if (!hasIndicatorPane) indEl.style.display = "none";

      const baseOptions = {
        layout: { background: { color: p.theme.background }, textColor: p.theme.text },
        grid: { vertLines: { color: p.theme.grid }, horzLines: { color: p.theme.grid } },
        rightPriceScale: {
          visible: true,
          borderVisible: true,
          borderColor: p.theme.scaleBorder,
          ticksVisible: true,
        },
        leftPriceScale: { visible: false },
        timeScale: {
          visible: true,
          borderVisible: true,
          borderColor: p.theme.scaleBorder,
          timeVisible: true,
          secondsVisible: false,
          ticksVisible: true,
        },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: true,
        },
        handleScale: {
          axisPressedMouseMove: true,
          mouseWheel: true,
          pinch: true,
        },
      };

      const main = LightweightCharts.createChart(document.getElementById("main"), baseOptions);
      const candleSeries = main.addCandlestickSeries({
        upColor: "#16a34a",
        downColor: "#dc2626",
        borderVisible: false,
        wickUpColor: "#16a34a",
        wickDownColor: "#dc2626",
      });
      candleSeries.setData(p.candles);

      if (p.showMA && p.ma.length) {
        const ma = main.addLineSeries({ color: "#f59e0b", lineWidth: 2, priceLineVisible: false });
        ma.setData(p.ma);
      }

      if (p.showVolume) {
          const vol = main.addHistogramSeries({
            priceFormat: { type: "volume" },
            priceScaleId: "vol",
            color: p.theme.volume,
            base: 0,
          });
        main.priceScale("vol").applyOptions({
          scaleMargins: { top: 0.8, bottom: 0 },
          borderVisible: false,
        });
        const bars = p.candles
          .filter((x) => x.volume != null)
          .map((x) => ({
            time: x.time,
            value: x.volume,
            color: x.close >= x.open ? "rgba(22,163,74,0.50)" : "rgba(220,38,38,0.50)",
          }));
        vol.setData(bars);
      }

      let ind = null;
      if (hasIndicatorPane) {
        ind = LightweightCharts.createChart(indEl, {
          ...baseOptions,
          rightPriceScale: { borderColor: p.theme.scaleBorder, scaleMargins: { top: 0.08, bottom: 0.08 } },
        });
        let indPrimarySeries = null;

        if (p.showRSI && p.rsi.length) {
          const rsi = ind.addLineSeries({ color: p.theme.rsi, lineWidth: 2, priceLineVisible: false });
          rsi.setData(p.rsi);
          indPrimarySeries = indPrimarySeries || rsi;
          const overbought = ind.addLineSeries({ color: p.theme.overLine, lineStyle: 2, lineWidth: 1, priceLineVisible: false });
          const oversold = ind.addLineSeries({ color: p.theme.overLine, lineStyle: 2, lineWidth: 1, priceLineVisible: false });
          overbought.setData(p.rsi.map((x) => ({ time: x.time, value: 70 })));
          oversold.setData(p.rsi.map((x) => ({ time: x.time, value: 30 })));
        }

        if (p.showMACD && p.macdHistogram.length) {
          const hist = ind.addHistogramSeries({ priceLineVisible: false });
          hist.setData(p.macdHistogram);
          indPrimarySeries = indPrimarySeries || hist;
          if (p.macdLine.length) {
            const macdLine = ind.addLineSeries({ color: "#22c55e", lineWidth: 2, priceLineVisible: false });
            macdLine.setData(p.macdLine);
            indPrimarySeries = indPrimarySeries || macdLine;
          }
          if (p.macdSignal.length) {
            const macdSignal = ind.addLineSeries({ color: "#f97316", lineWidth: 2, priceLineVisible: false });
            macdSignal.setData(p.macdSignal);
          }
        }

        let isSyncing = false;
        const syncMainToInd = () => {
          if (isSyncing) return;
          const range = main.timeScale().getVisibleLogicalRange();
          if (!range) return;
          isSyncing = true;
          try {
            ind.timeScale().setVisibleLogicalRange(range);
          } finally {
            isSyncing = false;
          }
        };
        const syncIndToMain = () => {
          if (isSyncing) return;
          const range = ind.timeScale().getVisibleLogicalRange();
          if (!range) return;
          isSyncing = true;
          try {
            main.timeScale().setVisibleLogicalRange(range);
          } finally {
            isSyncing = false;
          }
        };
        main.timeScale().subscribeVisibleLogicalRangeChange(syncMainToInd);
        ind.timeScale().subscribeVisibleLogicalRangeChange(syncIndToMain);
        syncMainToInd();

        const canSyncCrosshair =
          typeof main.setCrosshairPosition === "function" &&
          typeof ind.setCrosshairPosition === "function" &&
          indPrimarySeries;
        if (canSyncCrosshair) {
          let isCrosshairSyncing = false;
          const extractPrice = (param, seriesRef) => {
            if (!param || !param.time || !param.seriesData || !seriesRef) return null;
            const point = param.seriesData.get(seriesRef);
            if (point == null) return null;
            if (typeof point === "number") return point;
            if (typeof point.value === "number") return point.value;
            if (typeof point.close === "number") return point.close;
            return null;
          };

          const onMainCrosshair = (param) => {
            if (isCrosshairSyncing) return;
            if (!param || !param.time) {
              if (typeof ind.clearCrosshairPosition === "function") ind.clearCrosshairPosition();
              return;
            }
            const price = extractPrice(param, candleSeries);
            if (price == null) return;
            isCrosshairSyncing = true;
            try {
              ind.setCrosshairPosition(price, param.time, indPrimarySeries);
            } finally {
              isCrosshairSyncing = false;
            }
          };

          const onIndCrosshair = (param) => {
            if (isCrosshairSyncing) return;
            if (!param || !param.time) {
              if (typeof main.clearCrosshairPosition === "function") main.clearCrosshairPosition();
              return;
            }
            const price = extractPrice(param, indPrimarySeries);
            if (price == null) return;
            isCrosshairSyncing = true;
            try {
              main.setCrosshairPosition(price, param.time, candleSeries);
            } finally {
              isCrosshairSyncing = false;
            }
          };

          main.subscribeCrosshairMove(onMainCrosshair);
          ind.subscribeCrosshairMove(onIndCrosshair);
        }
      }

      main.timeScale().fitContent();

      const applySize = () => {
        const mainRect = document.getElementById("main").getBoundingClientRect();
        main.applyOptions({ width: mainRect.width, height: mainRect.height });
        if (ind) {
          const indRect = indEl.getBoundingClientRect();
          ind.applyOptions({ width: indRect.width, height: indRect.height });
        }
      };
      applySize();
      if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(() => applySize());
        ro.observe(document.body);
      } else {
        window.addEventListener("resize", applySize);
      }
    </script>
  </body>
</html>`;
  }, [
    candles,
    maSeries,
    rsiSeries,
    macdLine,
    macdSignal,
    macdHistogram,
    showMA,
    showRSI,
    showMACD,
    showVolume,
    isLight,
  ]);

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: isLight ? palette.card : "#0b1220",
          borderColor: palette.cardBorder,
        },
      ]}
    >
      <WebView
        source={{ html }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        nestedScrollEnabled
        overScrollMode="never"
        bounces={false}
        onMessage={() => {}}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 380,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
