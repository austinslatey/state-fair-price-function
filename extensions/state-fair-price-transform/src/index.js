export default async function (input) {
  const cart = input.cart;
  const updatedLines = cart.lines.map((line) => {
    // Check if customer is logged in
    const customer = input.context.customer;
    if (!customer) return line;

    // Check if product has 'state-fair-sale' tag
    const isStateFairProduct = line.merchandise.product.tags?.includes("state-fair-sale");
    if (!isStateFairProduct) return line;

    // Get state_fair_price metafield
    const stateFairPrice = line.merchandise.product.metafields?.find(
      (metafield) => metafield.namespace === "custom" && metafield.key === "state_fair_price"
    );
    if (!stateFairPrice || !stateFairPrice.value) return line;

    // Convert price to cents
    const stateFairPriceCents = parseFloat(stateFairPrice.value) * 100;

    return {
      ...line,
      cost: {
        ...line.cost,
        totalAmount: {
          amount: stateFairPriceCents * line.quantity,
          currencyCode: line.cost.totalAmount.currencyCode,
        },
        unitAmount: {
          amount: stateFairPriceCents,
          currencyCode: line.cost.unitAmount.currencyCode,
        },
      },
    };
  });

  return {
    operations: [
      {
        update: {
          cartLines: updatedLines,
        },
      },
    ],
  };
}