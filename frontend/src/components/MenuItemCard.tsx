import { MenuItem } from '../types';

interface Props {
  item: MenuItem;
  quantity: number;
  onAdd: (item: MenuItem) => void;
  onIncrement: (item: MenuItem) => void;
  onDecrement: (item: MenuItem) => void;
}

const MenuItemCard = ({ item, quantity, onAdd, onIncrement, onDecrement }: Props) => {
  return (
    <div className="menu-item-row">
      <div>
        <span className="veg-dot" />
        <strong>{item.itemName}</strong>
        <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--color-muted)' }}>{item.description}</p>
        <span style={{ fontWeight: 600 }}>₹{item.price}</span>
      </div>
      {quantity > 0 ? (
        <div className="qty-stepper">
          <button onClick={() => onDecrement(item)}>−</button>
          <span>{quantity}</span>
          <button className="primary" onClick={() => onIncrement(item)}>+</button>
        </div>
      ) : (
        <button className="btn btn-primary" disabled={!item.isAvailable} onClick={() => onAdd(item)}>
          {item.isAvailable ? 'Add' : 'Unavailable'}
        </button>
      )}
    </div>
  );
};

export default MenuItemCard;
