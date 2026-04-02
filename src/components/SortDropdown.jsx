import { Clock, ArrowUp, ArrowDown, Users } from 'lucide-react';
import CustomSelect from './CustomSelect';

export const SORT_OPTIONS = [
    { value: 'departure', label: 'Departure', Icon: Clock },
    { value: 'price', label: 'Price Low', Icon: ArrowUp },
    { value: 'price-desc', label: 'Price High', Icon: ArrowDown },
    { value: 'seats', label: 'Most Seats', Icon: Users },
];

export default function SortDropdown({ value, onChange, options = SORT_OPTIONS }) {
    return <CustomSelect value={value} onChange={onChange} options={options} />;
}