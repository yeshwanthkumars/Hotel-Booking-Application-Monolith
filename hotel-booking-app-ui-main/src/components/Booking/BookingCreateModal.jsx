import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import BookingForm from './BookingForm';

export default function BookingCreateModal({ roomId, isOpen, onClose, onSuccess }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <BookingForm
      roomId={roomId}
      showInlineSuccess={false}
      onClose={onClose}
      onSuccess={(booking) => {
        onSuccess?.(booking);
        onClose();
        if (booking?.id) {
           navigate(`/payment/${booking.id}`, { state: { booking } });
        }
      }}
    />
  );
}

BookingCreateModal.propTypes = {
  roomId: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

BookingCreateModal.defaultProps = {
  onSuccess: undefined,
};
