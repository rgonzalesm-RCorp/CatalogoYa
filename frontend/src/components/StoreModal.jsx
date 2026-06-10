import Modal from './Modal';
import StoreForm from './StoreForm';

function StoreModal({
  isOpen,
  mode = 'create',
  store,
  onClose,
  onSubmit,
  submitting = false,
}) {
  const isEditing = mode === 'edit';

  return (
    <Modal
      description={isEditing
        ? `Actualiza la informacion de ${store?.Nombre || 'la tienda seleccionada'}.`
        : 'Crea una nueva tienda con su identidad visual, contacto y URL publica.'}
      maxWidthClass="max-w-5xl"
      onClose={submitting ? () => {} : onClose}
      open={isOpen}
      title={isEditing ? 'Editar tienda' : 'Crear tienda'}
    >
      <StoreForm
        initialValues={store}
        mode={mode}
        onCancel={onClose}
        onSubmit={onSubmit}
        submitting={submitting}
        stickyFooter
      />
    </Modal>
  );
}

export default StoreModal;
