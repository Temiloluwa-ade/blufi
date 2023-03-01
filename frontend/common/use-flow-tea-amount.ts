/**
 * Utility function that converts bluFi's to FLOW.
 */
import { useFlowPrice } from "./use-flow-price";
import { round } from "./utils";

const FLOW_TEA_IN_USD = 5; // 1 bluFi = 5$

export function useBluFiAmount(bluFiAmount: number) {
  const { data, mutate } = useFlowPrice();
  const flowUsdPrice = data?.usd ?? 0;
  const flowAmount = round((FLOW_TEA_IN_USD / flowUsdPrice) * bluFiAmount, 2);
  const usdAmount = round(flowAmount * flowUsdPrice, 2);
  return { flowAmount, usdAmount, flowUsdPrice, refresh: mutate };
}
