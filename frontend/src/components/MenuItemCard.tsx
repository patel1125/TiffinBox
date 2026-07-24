import { useState } from "react";
import { MenuItem } from "../types";

interface Props {
  item: MenuItem;
  quantity: number;
  onAdd: (item: MenuItem) => void;
  onIncrement: (item: MenuItem) => void;
  onDecrement: (item: MenuItem) => void;
}

const MenuItemCard = ({
  item,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const isVeg = item.isVeg ?? false;
  const categoryName = typeof item.categoryId === 'string' ? '' : item.categoryId.categoryName;

  const handleAdd = async () => {
    if (!item.isAvailable || loading) return;

    setLoading(true);

    try {
      await Promise.resolve(onAdd(item));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="menu-item-row">

      <div className="menu-item-info">

        <div className="menu-item-header">

          <span
            className={`veg-dot ${
              isVeg ? "veg" : "non-veg"
            }`}
          />

          <strong>{item.itemName}</strong>

          {!item.isAvailable && (
            <span className="status-badge unavailable">
              Out of Stock
            </span>
          )}

        </div>

        <p className="menu-description">
          {item.description || "No description available."}
        </p>

        <div className="menu-footer">

          <span className="menu-price">
            ₹{item.price.toFixed(2)}
          </span>

          {categoryName && (
            <span className="menu-category">
              {categoryName}
            </span>
          )}

        </div>

      </div>

      {quantity > 0 ? (
        <div className="qty-stepper">

          <button
            aria-label="Decrease quantity"
            onClick={() => onDecrement(item)}
          >
            −
          </button>

          <span>{quantity}</span>

          <button
            className="primary"
            aria-label="Increase quantity"
            onClick={() => onIncrement(item)}
          >
            +
          </button>

        </div>
      ) : (
        <button
          className="btn btn-primary"
          disabled={!item.isAvailable || loading}
          onClick={handleAdd}
        >
          {loading
            ? "Adding..."
            : item.isAvailable
            ? "Add"
            : "Unavailable"}
        </button>
      )}

    </div>
  );
};

export default MenuItemCard;
