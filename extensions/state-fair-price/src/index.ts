import {
  shopifyFunction,
  CartLineChange,
  CartLinesUpdateInput,
  CartLinesUpdate,
} from '@shopify/shopify_function';

shopifyFunction(
  'discounts/cart-transform',
  (input: CartLinesUpdateInput) => {
    const changes: CartLineChange[] = [];

    input.cart.lines.forEach((line) => {
      // Read the state_fair_price metafield if it exists
      const stateFairPriceString =
        line.merchandise.product.metafields?.custom?.state_fair_price;

      if (stateFairPriceString) {
        const price = parseFloat(stateFairPriceString);

        if (!isNaN(price)) {
          changes.push({
            id: line.id,
            merchandiseId: line.merchandise.id,
            quantity: line.quantity,
            customTotalPrice: {
              amount: price * line.quantity, // total price for this line
              currencyCode: line.merchandise.price.currencyCode,
            },
          });
        }
      }
    });

    return { cartLinesUpdate: changes as CartLinesUpdate };
  }
);