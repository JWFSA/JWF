import Swal from 'sweetalert2';

/** Confirmación de eliminación. Devuelve true si el usuario confirma. */
export async function confirmDelete(message = '¿Eliminar este registro?'): Promise<boolean> {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });
  return result.isConfirmed;
}

/** Confirmación genérica para acciones. Devuelve true si el usuario confirma. */
export async function confirmAction(message: string, confirmText = 'Sí, continuar'): Promise<boolean> {
  const result = await Swal.fire({
    title: 'Confirmar',
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#4f46e5',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
  });
  return result.isConfirmed;
}

/** Toast de éxito (se cierra solo en 2s). */
export function showSuccess(text = 'Operación exitosa') {
  Swal.fire({ icon: 'success', title: 'Guardado', text, timer: 2000, showConfirmButton: false });
}

/** Alerta de error. */
export function showError(text = 'Ocurrió un error') {
  Swal.fire({ icon: 'error', title: 'Error', text });
}

/** Alerta informativa. */
export function showInfo(text: string) {
  Swal.fire({ icon: 'info', title: 'Información', text, timer: 2500, showConfirmButton: false });
}
