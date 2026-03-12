import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  bootstrapVirtualMarket,
  fetchVirtualMarketOrders,
  fetchVirtualMarketPortfolio,
  fetchVirtualMarketStocks,
  placeVirtualMarketOrder,
} from "../../api/virtualMarket";
import VirtualMarketContent from "./VirtualMarketContent";
import { parsePositiveQuantity } from "./virtualMarketUtils";

export default function VirtualMarket({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tradeError, setTradeError] = useState("");
  const [tradeMessage, setTradeMessage] = useState("");
  const [portfolio, setPortfolio] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [quantityInput, setQuantityInput] = useState("");

  const unlockedSymbols = useMemo(
    () =>
      stocks
        .filter((item) => item.is_unlocked)
        .map((item) => String(item.symbol || "").toUpperCase()),
    [stocks]
  );

  const loadMarket = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError("");

    try {
      await bootstrapVirtualMarket();
      const [stocksRes, portfolioRes, ordersRes] = await Promise.all([
        fetchVirtualMarketStocks(),
        fetchVirtualMarketPortfolio(),
        fetchVirtualMarketOrders({ limit: 20 }),
      ]);

      setStocks(Array.isArray(stocksRes?.items) ? stocksRes.items : []);
      setPortfolio(portfolioRes || null);
      setOrders(Array.isArray(ordersRes?.items) ? ordersRes.items : []);
    } catch (err) {
      setError(err?.message || "Failed to load virtual market.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMarket({ showLoading: true });
  }, [loadMarket]);

  useEffect(() => {
    if (!unlockedSymbols.length) {
      setSelectedSymbol("");
      return;
    }
    if (!selectedSymbol || !unlockedSymbols.includes(selectedSymbol)) {
      setSelectedSymbol(unlockedSymbols[0]);
    }
  }, [selectedSymbol, unlockedSymbols]);

  const refreshAfterTrade = useCallback(async () => {
    const [portfolioRes, ordersRes] = await Promise.all([
      fetchVirtualMarketPortfolio(),
      fetchVirtualMarketOrders({ limit: 20 }),
    ]);
    setPortfolio(portfolioRes || null);
    setOrders(Array.isArray(ordersRes?.items) ? ordersRes.items : []);
  }, []);

  const submitOrder = useCallback(
    async (side) => {
      if (submitting) return;

      const quantity = parsePositiveQuantity(quantityInput);
      if (!selectedSymbol) {
        setTradeError("Choose an unlocked symbol first.");
        setTradeMessage("");
        return;
      }
      if (!quantity) {
        setTradeError("Enter a valid quantity greater than zero.");
        setTradeMessage("");
        return;
      }

      setSubmitting(true);
      setTradeError("");
      setTradeMessage("");

      try {
        const order = await placeVirtualMarketOrder({
          side,
          symbol: selectedSymbol,
          quantity,
          clientOrderId: `vm-${side}-${Date.now()}`,
        });
        await refreshAfterTrade();
        setQuantityInput("");
        setTradeMessage(
          `${side === "buy" ? "Bought" : "Sold"} ${order?.quantity || quantity} ${selectedSymbol} at ${
            order?.unit_price ?? "--"
          }`
        );
      } catch (err) {
        setTradeError(err?.message || "Failed to place order.");
      } finally {
        setSubmitting(false);
      }
    },
    [quantityInput, refreshAfterTrade, selectedSymbol, submitting]
  );

  return (
    <VirtualMarketContent
      navigation={navigation}
      loading={loading}
      error={error}
      refreshing={refreshing}
      portfolio={portfolio}
      stocks={stocks}
      orders={orders}
      selectedSymbol={selectedSymbol}
      quantityInput={quantityInput}
      submitting={submitting}
      tradeMessage={tradeMessage}
      tradeError={tradeError}
      onRetry={() => loadMarket({ showLoading: true })}
      onRefresh={() => loadMarket({ showLoading: false })}
      onSelectSymbol={setSelectedSymbol}
      onQuantityChange={setQuantityInput}
      onBuy={() => submitOrder("buy")}
      onSell={() => submitOrder("sell")}
      onOpenJournal={() => navigation.navigate("TradingJournal")}
    />
  );
}
