import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Calendar from '@/components/Calendar';
import { Appointment } from '@/types/calendar';

// Mock data for testing
const mockAppointments: Appointment[] = [
  {
    id: '1',
    date: '21-11-2025',
    time: '14:30',
    contactName: 'Peter van der Meer',
    category: 'Ghostin 06',
    createdAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    date: '21-11-2025',
    time: '16:00',
    contactName: 'John Doe',
    category: 'Meeting',
    createdAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '3',
    date: '22-11-2025',
    time: '09:00',
    contactName: 'Jane Smith',
    category: 'Call',
    createdAt: '2024-01-01T10:00:00Z',
  },
];

const mockOnDeleteAppointment = jest.fn();

describe('Calendar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no appointments', () => {
    render(<Calendar appointments={[]} onDeleteAppointment={mockOnDeleteAppointment} />);

    expect(screen.getByText('No appointments scheduled')).toBeInTheDocument();
    expect(screen.getByText('Get started by adding your first appointment.')).toBeInTheDocument();
  });

  it('renders appointments grouped by date', () => {
    render(<Calendar appointments={mockAppointments} onDeleteAppointment={mockOnDeleteAppointment} />);

    // Check if dates are rendered
    expect(screen.getByText('Friday 21-11-2025')).toBeInTheDocument();
    expect(screen.getByText('Saturday 22-11-2025')).toBeInTheDocument();

    // Check if appointment details are rendered
    expect(screen.getByText('Peter van der Meer')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Check if times and categories are rendered
    expect(screen.getAllByText('14:30')).toHaveLength(1);
    expect(screen.getAllByText('16:00')).toHaveLength(1);
    expect(screen.getAllByText('09:00')).toHaveLength(1);
    expect(screen.getAllByText('Ghostin 06')).toHaveLength(1);
    expect(screen.getAllByText('Meeting')).toHaveLength(1);
    expect(screen.getAllByText('Call')).toHaveLength(1);
  });

  it('displays correct appointment count per date', () => {
    render(<Calendar appointments={mockAppointments} onDeleteAppointment={mockOnDeleteAppointment} />);

    expect(screen.getByText('2 appointments')).toBeInTheDocument();
    expect(screen.getByText('1 appointment')).toBeInTheDocument();
  });

  it('calls onDeleteAppointment when delete button is clicked', () => {
    // Mock window.confirm to return true
    const mockConfirm = jest.spyOn(window, 'confirm');
    mockConfirm.mockImplementation(() => true);

    render(<Calendar appointments={[mockAppointments[0]]} onDeleteAppointment={mockOnDeleteAppointment} />);

    const deleteButton = screen.getByTitle('Delete appointment');
    fireEvent.click(deleteButton);

    expect(mockOnDeleteAppointment).toHaveBeenCalledWith('1');
    expect(mockOnDeleteAppointment).toHaveBeenCalledTimes(1);

    mockConfirm.mockRestore();
  });

  it('does not call onDeleteAppointment when user cancels deletion', () => {
    // Mock window.confirm to return false
    const mockConfirm = jest.spyOn(window, 'confirm');
    mockConfirm.mockImplementation(() => false);

    render(<Calendar appointments={[mockAppointments[0]]} onDeleteAppointment={mockOnDeleteAppointment} />);

    const deleteButton = screen.getByTitle('Delete appointment');
    fireEvent.click(deleteButton);

    expect(mockOnDeleteAppointment).not.toHaveBeenCalled();

    mockConfirm.mockRestore();
  });

  it('sorts appointments chronologically by date and time', () => {
    const unsortedAppointments: Appointment[] = [
      {
        id: '3',
        date: '22-11-2025',
        time: '09:00',
        contactName: 'Jane Smith',
        category: 'Call',
        createdAt: '2024-01-01T10:00:00Z',
      },
      {
        id: '1',
        date: '21-11-2025',
        time: '16:00',
        contactName: 'John Doe',
        category: 'Meeting',
        createdAt: '2024-01-01T10:00:00Z',
      },
      {
        id: '2',
        date: '21-11-2025',
        time: '14:30',
        contactName: 'Peter van der Meer',
        category: 'Ghostin 06',
        createdAt: '2024-01-01T10:00:00Z',
      },
    ];

    render(<Calendar appointments={unsortedAppointments} onDeleteAppointment={mockOnDeleteAppointment} />);

    const dateHeaders = screen.getAllByRole('heading', { level: 3 });

    // Check that dates are in chronological order
    expect(dateHeaders[0]).toHaveTextContent('Friday 21-11-2025');
    expect(dateHeaders[1]).toHaveTextContent('Saturday 22-11-2025');
  });

  it('handles appointments with different date formats correctly', () => {
    const appointmentsWithDifferentDates: Appointment[] = [
      {
        id: '1',
        date: '01-01-2025',
        time: '10:00',
        contactName: 'Test Contact',
        category: 'Test Category',
        createdAt: '2024-01-01T10:00:00Z',
      },
      {
        id: '2',
        date: '31-12-2024',
        time: '23:59',
        contactName: 'Another Contact',
        category: 'Another Category',
        createdAt: '2024-01-01T10:00:00Z',
      },
    ];

    render(
      <Calendar
        appointments={appointmentsWithDifferentDates}
        onDeleteAppointment={mockOnDeleteAppointment}
      />
    );

    expect(screen.getByText('Tuesday 31-12-2024')).toBeInTheDocument();
    expect(screen.getByText('Wednesday 01-01-2025')).toBeInTheDocument();
  });
});
