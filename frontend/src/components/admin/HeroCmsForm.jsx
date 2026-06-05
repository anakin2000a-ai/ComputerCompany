import DynamicForm from '../../components/DynamicForm';

export default function AdminHeroPage({ mode }) {
  const heroFields = [
    { name: 'page', label: 'Target Page Identity' },
    { name: 'small_title', label: 'Small Top Title' },
    { name: 'title', label: 'Main Core Title' },
    { name: 'highlighted_title', label: 'Highlighted Accent Title' },
    { name: 'subtitle', label: 'Subtitle / Description Paragraph', multiline: true, rows: 3 },
    { name: 'background_image', label: 'Upload Background Image', type: 'file' },
    { name: 'is_active', label: 'Publish Immediately (Active Status)', type: 'checkbox' }
  ];

  const initialValues = {
    page: 'home',
    small_title: '',
    title: '',
    highlighted_title: '',
    subtitle: '',
    is_active: true
  };

  return (
    <DynamicForm
      mode={mode}
      title="Create New Hero Section"
      fields={heroFields}
      initialValues={initialValues}
      submitUrl="http://127.0.0.1:8000/api/v1/admin/hero-sections"  // Fixes route endpoint mismatch
      successMessage="Hero configuration saved!"
      isMultipart={true} // Switches form engine over to stream layout automatically
      onSuccess={(data) => console.log('Successfully saved to v1 API:', data)}
    />
  );
}