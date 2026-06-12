import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { HOTEL_TYPES, STAR_RATINGS, PLACEHOLDER_HOTEL_IMAGE, getRoleFromStorage } from '../../constants/hotelConstants';
import useHotelMutations from '../../hooks/useHotelMutations';
import HotelImageUpload from './HotelImageUpload';

const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Minimum 2 characters').max(100, 'Maximum 100 characters'),
  location: yup.string().required('Location is required').min(2, 'Minimum 2 characters').max(100, 'Maximum 100 characters'),
  description: yup.string().nullable().max(500, 'Maximum 500 characters'),
  address: yup.string().nullable(),
  city: yup.string().nullable(),
  state: yup.string().nullable(),
  country: yup.string().nullable(),
  phoneNumber: yup.string().nullable(),
  email: yup.string().nullable().email('Please enter a valid email'),
  starRating: yup.number().nullable().integer('Star rating must be an integer').min(1).max(5),
  hotelType: yup.string().nullable().oneOf([...HOTEL_TYPES.map((type) => type.value), null, '']),
  checkInTime: yup.string().nullable().matches(TIME_REGEX, { message: 'Invalid time format (HH:mm)', excludeEmptyString: true }),
  checkOutTime: yup
    .string()
    .nullable()
    .matches(TIME_REGEX, { message: 'Invalid time format (HH:mm)', excludeEmptyString: true })
    .test('check-out-before-check-in', 'Check-out time must be before check-in when both are provided', function validateCheckOut(checkOutTime) {
      const { checkInTime } = this.parent;
      if (!checkOutTime || !checkInTime || !TIME_REGEX.test(checkOutTime) || !TIME_REGEX.test(checkInTime)) {
        return true;
      }
      return checkOutTime < checkInTime;
    }),
  amenities: yup.array().of(yup.string().trim().min(1, 'Amenity cannot be empty')).nullable(),
  isActive: yup.boolean().default(true),
});

function buildDefaults(hotel) {
  return {
    name: hotel?.name || '',
    location: hotel?.location || '',
    description: hotel?.description || '',
    address: hotel?.address || '',
    city: hotel?.city || '',
    state: hotel?.state || '',
    country: hotel?.country || '',
    phoneNumber: hotel?.phoneNumber || '',
    email: hotel?.email || '',
    starRating: hotel?.starRating ?? null,
    hotelType: hotel?.hotelType || '',
    checkInTime: hotel?.checkInTime || '',
    checkOutTime: hotel?.checkOutTime || '',
    amenities: Array.isArray(hotel?.amenities) ? hotel.amenities : [],
    isActive: hotel?.isActive ?? true,
  };
}

function AmenityInput({ value, onChange }) {
  const [input, setInput] = useState('');

  const addAmenity = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const next = [...(value || []), trimmed];
    onChange(next);
    setInput('');
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addAmenity();
            }
          }}
          placeholder="Type amenity and press Enter"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-600 focus:outline-none"
        />
        <button type="button" onClick={addAmenity} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700">Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(value || []).slice().sort((a, b) => a.localeCompare(b)).map((amenity, idx) => (
          <span key={`${amenity}-${idx}`} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
            {amenity}
            <button
              type="button"
              onClick={() => onChange((value || []).filter((_, i) => i !== idx))}
              className="text-slate-500 hover:text-red-600"
              aria-label={`Remove ${amenity}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

AmenityInput.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
};

AmenityInput.defaultProps = {
  value: [],
};

export default function HotelForm({ hotel, onSuccess, onClose }) {
  const isAdmin = getRoleFromStorage() === 'ADMIN';
  const inputRef = useRef(null);
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [pendingPreview, setPendingPreview] = useState(PLACEHOLDER_HOTEL_IMAGE);
  const [hoveredStar, setHoveredStar] = useState(0);
  const { createHotel, updateHotel, uploadImage, loading, error } = useHotelMutations();

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: buildDefaults(hotel),
  });

  const descriptionLength = watch('description')?.length || 0;
  const existingHotelId = hotel?.id;

  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
      amenities: (formData.amenities || []).filter(Boolean),
    };

    const savedHotel = existingHotelId
      ? await updateHotel(existingHotelId, payload)
      : await createHotel(payload);

    if (pendingImageFile && savedHotel?.id) {
      await uploadImage(savedHotel.id, pendingImageFile);
    }

    onSuccess?.(savedHotel);
  };

  const pickImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;
    setPendingImageFile(file);
    setPendingPreview(URL.createObjectURL(file));
  };

  const title = existingHotelId ? 'Edit Hotel' : 'Create Hotel';

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm"><span>Name *</span><input {...register('name')} className="w-full rounded-lg border border-gray-300 px-3 py-2" />{errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}</label>
            <label className="space-y-1 text-sm"><span>Location *</span><input {...register('location')} className="w-full rounded-lg border border-gray-300 px-3 py-2" />{errors.location && <p className="text-xs text-red-600">{errors.location.message}</p>}</label>
            <label className="space-y-1 text-sm md:col-span-2"><span>Description</span><textarea {...register('description')} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
              <p className="text-xs text-gray-500">{descriptionLength}/500</p>
              {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
            </label>
            <label className="space-y-1 text-sm"><span>Address</span><input {...register('address')} className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span>City</span><input {...register('city')} className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span>State</span><input {...register('state')} className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span>Country</span><input {...register('country')} className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span>Phone Number</span><input {...register('phoneNumber')} className="w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span>Email</span><input {...register('email')} type="email" className="w-full rounded-lg border border-gray-300 px-3 py-2" />{errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}</label>
            <label className="space-y-1 text-sm"><span>Hotel Type</span><select {...register('hotelType')} className="w-full rounded-lg border border-gray-300 px-3 py-2"><option value="">Select type</option>{HOTEL_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select>{errors.hotelType && <p className="text-xs text-red-600">{errors.hotelType.message}</p>}</label>
            <label className="space-y-1 text-sm"><span>Check-in Time</span><input type="time" {...register('checkInTime')} className="w-full rounded-lg border border-gray-300 px-3 py-2" />{errors.checkInTime && <p className="text-xs text-red-600">{errors.checkInTime.message}</p>}</label>
            <label className="space-y-1 text-sm"><span>Check-out Time</span><input type="time" {...register('checkOutTime')} className="w-full rounded-lg border border-gray-300 px-3 py-2" />{errors.checkOutTime && <p className="text-xs text-red-600">{errors.checkOutTime.message}</p>}</label>

            <div className="space-y-2 text-sm">
              <span>Star Rating</span>
              <Controller
                control={control}
                name="starRating"
                render={({ field }) => (
                  <div className="flex items-center gap-1">
                    {STAR_RATINGS.map((star) => {
                      const isFilled = hoveredStar ? star <= hoveredStar : star <= (field.value || 0);
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => field.onChange(field.value === star ? null : star)}
                          className="text-2xl"
                          style={{ color: isFilled ? '#f59e0b' : '#d1d5db' }}
                          aria-label={`Set ${star} stars`}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              {errors.starRating && <p className="text-xs text-red-600">{errors.starRating.message}</p>}
            </div>

            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('isActive')} className="h-4 w-4 rounded border-gray-300" />
              Active
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Amenities</p>
            <Controller
              control={control}
              name="amenities"
              render={({ field }) => <AmenityInput value={field.value} onChange={field.onChange} />}
            />
            {errors.amenities && <p className="text-xs text-red-600">{errors.amenities.message}</p>}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-slate-50 p-4">
            <h4 className="text-sm font-semibold text-gray-800">Image Upload</h4>
            {existingHotelId ? (
              <div className="mt-3">
                <HotelImageUpload hotelId={existingHotelId} onUploadSuccess={onSuccess} onDeleteSuccess={onSuccess} />
              </div>
            ) : (
              <>
                <p className="mt-1 text-xs text-gray-500">Image is uploaded right after hotel is created. Max size 5MB.</p>
                <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <img src={pendingPreview} alt="Pending upload preview" className="h-40 w-full object-cover" />
                </div>
                <div className="mt-3 rounded-xl border border-dashed border-gray-300 p-4 text-center">
                  <button type="button" onClick={() => inputRef.current?.click()} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700">Choose Image</button>
                  <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickImage(e.target.files?.[0])} />
                  {pendingImageFile && <p className="mt-2 text-xs text-gray-600">Selected: {pendingImageFile.name}</p>}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">{loading ? 'Saving...' : existingHotelId ? 'Update Hotel' : 'Create Hotel'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

HotelForm.propTypes = {
  hotel: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    location: PropTypes.string,
    description: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    country: PropTypes.string,
    phoneNumber: PropTypes.string,
    email: PropTypes.string,
    starRating: PropTypes.number,
    hotelType: PropTypes.string,
    checkInTime: PropTypes.string,
    checkOutTime: PropTypes.string,
    amenities: PropTypes.arrayOf(PropTypes.string),
    isActive: PropTypes.bool,
  }),
  onSuccess: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

HotelForm.defaultProps = {
  hotel: null,
  onSuccess: null,
};
