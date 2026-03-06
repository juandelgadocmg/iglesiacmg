// Mock data for CMG Admin

export interface Persona {
  id: string;
  nombres: string;
  apellidos: string;
  documento: string;
  fechaNacimiento: string;
  sexo: 'M' | 'F';
  telefono: string;
  email: string;
  direccion: string;
  estadoCivil: string;
  ocupacion: string;
  fechaConversion: string;
  fechaBautismo: string;
  fechaIngreso: string;
  estadoIglesia: 'Activo' | 'Inactivo' | 'En proceso';
  tipoPersona: 'Miembro' | 'Visitante' | 'Líder' | 'Servidor';
  grupo: string;
  ministerio: string;
  liderResponsable: string;
  observaciones: string;
  foto?: string;
}

export interface Grupo {
  id: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  lider: string;
  ubicacion: string;
  diaReunion: string;
  horaReunion: string;
  estado: 'Activo' | 'Inactivo';
  miembros: number;
}

export interface Servicio {
  id: string;
  nombre: string;
  tipo: string;
  fecha: string;
  hora: string;
  lugar: string;
  predicador: string;
  asistencia: number;
  estado: 'Programado' | 'Completado' | 'Cancelado';
}

export interface Finanza {
  id: string;
  tipo: 'Ingreso' | 'Gasto';
  categoria: string;
  descripcion: string;
  monto: number;
  fecha: string;
  metodoPago: string;
  personaRelacionada: string;
  registradoPor: string;
}

export interface Evento {
  id: string;
  nombre: string;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  lugar: string;
  cupos: number;
  inscritos: number;
  estado: 'Próximo' | 'En curso' | 'Finalizado';
  descripcion: string;
}

export const personas: Persona[] = [
  { id: '1', nombres: 'Carlos Eduardo', apellidos: 'Martínez López', documento: '1234567890', fechaNacimiento: '1985-03-15', sexo: 'M', telefono: '+57 300 123 4567', email: 'carlos.martinez@email.com', direccion: 'Calle 45 #12-34, Bogotá', estadoCivil: 'Casado', ocupacion: 'Ingeniero', fechaConversion: '2010-06-20', fechaBautismo: '2010-12-15', fechaIngreso: '2010-06-20', estadoIglesia: 'Activo', tipoPersona: 'Líder', grupo: 'Célula Norte', ministerio: 'Liderazgo', liderResponsable: 'Pastor Juan Pérez', observaciones: 'Líder de célula comprometido' },
  { id: '2', nombres: 'María Fernanda', apellidos: 'González Ruiz', documento: '9876543210', fechaNacimiento: '1990-07-22', sexo: 'F', telefono: '+57 311 234 5678', email: 'maria.gonzalez@email.com', direccion: 'Carrera 20 #55-10, Bogotá', estadoCivil: 'Soltera', ocupacion: 'Docente', fechaConversion: '2015-01-10', fechaBautismo: '2015-07-20', fechaIngreso: '2015-01-10', estadoIglesia: 'Activo', tipoPersona: 'Servidor', grupo: 'Jóvenes', ministerio: 'Alabanza', liderResponsable: 'Carlos Martínez', observaciones: 'Talento musical excepcional' },
  { id: '3', nombres: 'Andrés Felipe', apellidos: 'Rodríguez Sánchez', documento: '5678901234', fechaNacimiento: '1992-11-05', sexo: 'M', telefono: '+57 315 345 6789', email: 'andres.rodriguez@email.com', direccion: 'Av. 68 #30-45, Bogotá', estadoCivil: 'Casado', ocupacion: 'Contador', fechaConversion: '2018-03-15', fechaBautismo: '2018-09-10', fechaIngreso: '2018-03-15', estadoIglesia: 'Activo', tipoPersona: 'Miembro', grupo: 'Célula Sur', ministerio: 'Finanzas', liderResponsable: 'Carlos Martínez', observaciones: '' },
  { id: '4', nombres: 'Laura Camila', apellidos: 'Herrera Díaz', documento: '3456789012', fechaNacimiento: '1988-09-30', sexo: 'F', telefono: '+57 320 456 7890', email: 'laura.herrera@email.com', direccion: 'Calle 100 #15-20, Bogotá', estadoCivil: 'Casada', ocupacion: 'Médica', fechaConversion: '2012-05-12', fechaBautismo: '2012-11-25', fechaIngreso: '2012-05-12', estadoIglesia: 'Activo', tipoPersona: 'Líder', grupo: 'Mujeres', ministerio: 'Intercesión', liderResponsable: 'Pastor Juan Pérez', observaciones: 'Líder del ministerio de mujeres' },
  { id: '5', nombres: 'Santiago', apellidos: 'Morales Vargas', documento: '7890123456', fechaNacimiento: '1995-01-18', sexo: 'M', telefono: '+57 301 567 8901', email: 'santiago.morales@email.com', direccion: 'Transversal 5 #20-15, Bogotá', estadoCivil: 'Soltero', ocupacion: 'Diseñador', fechaConversion: '2020-02-28', fechaBautismo: '2020-08-15', fechaIngreso: '2020-02-28', estadoIglesia: 'Activo', tipoPersona: 'Servidor', grupo: 'Jóvenes', ministerio: 'Multimedia', liderResponsable: 'María González', observaciones: 'Encargado de diseño y redes' },
  { id: '6', nombres: 'Valentina', apellidos: 'Castro Mejía', documento: '2345678901', fechaNacimiento: '2000-04-10', sexo: 'F', telefono: '+57 318 678 9012', email: 'valentina.castro@email.com', direccion: 'Calle 72 #8-55, Bogotá', estadoCivil: 'Soltera', ocupacion: 'Estudiante', fechaConversion: '2022-08-05', fechaBautismo: '', fechaIngreso: '2022-08-05', estadoIglesia: 'En proceso', tipoPersona: 'Visitante', grupo: '', ministerio: '', liderResponsable: 'María González', observaciones: 'Nueva creyente, en proceso de discipulado' },
  { id: '7', nombres: 'Diego Alejandro', apellidos: 'Ramírez Torres', documento: '8901234567', fechaNacimiento: '1978-12-03', sexo: 'M', telefono: '+57 310 789 0123', email: 'diego.ramirez@email.com', direccion: 'Carrera 50 #40-30, Bogotá', estadoCivil: 'Casado', ocupacion: 'Empresario', fechaConversion: '2005-01-20', fechaBautismo: '2005-06-18', fechaIngreso: '2005-01-20', estadoIglesia: 'Activo', tipoPersona: 'Líder', grupo: 'Hombres', ministerio: 'Ujieres', liderResponsable: 'Pastor Juan Pérez', observaciones: 'Coordinador general de ujieres' },
  { id: '8', nombres: 'Isabella', apellidos: 'Mendoza Ríos', documento: '4567890123', fechaNacimiento: '1993-06-25', sexo: 'F', telefono: '+57 322 890 1234', email: 'isabella.mendoza@email.com', direccion: 'Calle 30 #25-60, Bogotá', estadoCivil: 'Soltera', ocupacion: 'Abogada', fechaConversion: '2017-11-10', fechaBautismo: '2018-04-22', fechaIngreso: '2017-11-10', estadoIglesia: 'Activo', tipoPersona: 'Miembro', grupo: 'Célula Norte', ministerio: 'Bienvenida', liderResponsable: 'Carlos Martínez', observaciones: '' },
];

export const grupos: Grupo[] = [
  { id: '1', nombre: 'Célula Norte', tipo: 'Células', descripcion: 'Célula del sector norte de la ciudad', lider: 'Carlos Martínez', ubicacion: 'Calle 45 #12-34', diaReunion: 'Miércoles', horaReunion: '19:00', estado: 'Activo', miembros: 12 },
  { id: '2', nombre: 'Célula Sur', tipo: 'Células', descripcion: 'Célula del sector sur de la ciudad', lider: 'Diego Ramírez', ubicacion: 'Carrera 50 #40-30', diaReunion: 'Jueves', horaReunion: '19:30', estado: 'Activo', miembros: 8 },
  { id: '3', nombre: 'Jóvenes CMG', tipo: 'Jóvenes', descripcion: 'Ministerio de jóvenes', lider: 'María González', ubicacion: 'Sede principal', diaReunion: 'Sábado', horaReunion: '16:00', estado: 'Activo', miembros: 25 },
  { id: '4', nombre: 'Mujeres de Fe', tipo: 'Mujeres', descripcion: 'Ministerio de mujeres', lider: 'Laura Herrera', ubicacion: 'Sede principal', diaReunion: 'Martes', horaReunion: '10:00', estado: 'Activo', miembros: 18 },
  { id: '5', nombre: 'Hombres de Valor', tipo: 'Hombres', descripcion: 'Ministerio de hombres', lider: 'Diego Ramírez', ubicacion: 'Sede principal', diaReunion: 'Viernes', horaReunion: '19:00', estado: 'Activo', miembros: 15 },
  { id: '6', nombre: 'Equipo de Alabanza', tipo: 'Alabanza', descripcion: 'Equipo de adoración y música', lider: 'María González', ubicacion: 'Sede principal', diaReunion: 'Sábado', horaReunion: '14:00', estado: 'Activo', miembros: 10 },
  { id: '7', nombre: 'Ujieres', tipo: 'Ujieres', descripcion: 'Equipo de servicio y bienvenida', lider: 'Diego Ramírez', ubicacion: 'Sede principal', diaReunion: 'Domingo', horaReunion: '07:00', estado: 'Activo', miembros: 8 },
  { id: '8', nombre: 'Escuela de Liderazgo', tipo: 'Liderazgo', descripcion: 'Formación de nuevos líderes', lider: 'Carlos Martínez', ubicacion: 'Sede principal', diaReunion: 'Sábado', horaReunion: '09:00', estado: 'Activo', miembros: 20 },
];

export const servicios: Servicio[] = [
  { id: '1', nombre: 'Culto Dominical - Primer Servicio', tipo: 'Culto general', fecha: '2026-03-01', hora: '08:00', lugar: 'Sede Principal', predicador: 'Pastor Juan Pérez', asistencia: 320, estado: 'Completado' },
  { id: '2', nombre: 'Culto Dominical - Segundo Servicio', tipo: 'Culto general', fecha: '2026-03-01', hora: '10:30', lugar: 'Sede Principal', predicador: 'Pastor Juan Pérez', asistencia: 280, estado: 'Completado' },
  { id: '3', nombre: 'Reunión de Oración', tipo: 'Oración', fecha: '2026-03-04', hora: '06:00', lugar: 'Sede Principal', predicador: 'Laura Herrera', asistencia: 45, estado: 'Completado' },
  { id: '4', nombre: 'Escuela Bíblica', tipo: 'Escuela bíblica', fecha: '2026-03-05', hora: '19:00', lugar: 'Sede Principal', predicador: 'Carlos Martínez', asistencia: 60, estado: 'Completado' },
  { id: '5', nombre: 'Culto Dominical', tipo: 'Culto general', fecha: '2026-03-08', hora: '08:00', lugar: 'Sede Principal', predicador: 'Pastor Juan Pérez', asistencia: 0, estado: 'Programado' },
  { id: '6', nombre: 'Vigilia de Adoración', tipo: 'Vigilia', fecha: '2026-03-14', hora: '21:00', lugar: 'Sede Principal', predicador: 'Pastor Juan Pérez', asistencia: 0, estado: 'Programado' },
];

export const finanzas: Finanza[] = [
  { id: '1', tipo: 'Ingreso', categoria: 'Diezmos', descripcion: 'Diezmos culto dominical', monto: 4500000, fecha: '2026-03-01', metodoPago: 'Efectivo', personaRelacionada: '', registradoPor: 'Tesorero' },
  { id: '2', tipo: 'Ingreso', categoria: 'Ofrendas', descripcion: 'Ofrenda culto dominical', monto: 2800000, fecha: '2026-03-01', metodoPago: 'Efectivo', personaRelacionada: '', registradoPor: 'Tesorero' },
  { id: '3', tipo: 'Ingreso', categoria: 'Donaciones', descripcion: 'Donación especial familia Ramírez', monto: 1500000, fecha: '2026-03-02', metodoPago: 'Transferencia', personaRelacionada: 'Diego Ramírez', registradoPor: 'Tesorero' },
  { id: '4', tipo: 'Gasto', categoria: 'Servicios públicos', descripcion: 'Pago energía eléctrica', monto: 850000, fecha: '2026-03-03', metodoPago: 'Transferencia', personaRelacionada: '', registradoPor: 'Admin' },
  { id: '5', tipo: 'Gasto', categoria: 'Mantenimiento', descripcion: 'Reparación sistema de sonido', monto: 1200000, fecha: '2026-03-04', metodoPago: 'Efectivo', personaRelacionada: '', registradoPor: 'Admin' },
  { id: '6', tipo: 'Ingreso', categoria: 'Diezmos', descripcion: 'Diezmos entre semana', monto: 1200000, fecha: '2026-03-05', metodoPago: 'Transferencia', personaRelacionada: '', registradoPor: 'Tesorero' },
  { id: '7', tipo: 'Gasto', categoria: 'Ayuda social', descripcion: 'Apoyo a familia necesitada', monto: 500000, fecha: '2026-03-05', metodoPago: 'Efectivo', personaRelacionada: '', registradoPor: 'Pastor' },
  { id: '8', tipo: 'Ingreso', categoria: 'Inscripciones', descripcion: 'Inscripciones retiro de jóvenes', monto: 3600000, fecha: '2026-03-06', metodoPago: 'Mixto', personaRelacionada: '', registradoPor: 'Secretaría' },
];

export const eventos: Evento[] = [
  { id: '1', nombre: 'Retiro de Jóvenes 2026', tipo: 'Retiro', fechaInicio: '2026-04-10', fechaFin: '2026-04-12', lugar: 'Finca El Refugio', cupos: 80, inscritos: 45, estado: 'Próximo', descripcion: 'Retiro espiritual para jóvenes con alabanza, enseñanza y actividades al aire libre' },
  { id: '2', nombre: 'Congreso de Mujeres', tipo: 'Congreso', fechaInicio: '2026-05-15', fechaFin: '2026-05-17', lugar: 'Sede Principal', cupos: 200, inscritos: 120, estado: 'Próximo', descripcion: 'Congreso anual de mujeres con invitadas especiales' },
  { id: '3', nombre: 'Campaña Evangelística', tipo: 'Campaña', fechaInicio: '2026-03-20', fechaFin: '2026-03-22', lugar: 'Parque Central', cupos: 500, inscritos: 0, estado: 'Próximo', descripcion: 'Campaña de evangelismo al aire libre' },
  { id: '4', nombre: 'Seminario de Liderazgo', tipo: 'Seminario', fechaInicio: '2026-06-05', fechaFin: '2026-06-05', lugar: 'Sede Principal', cupos: 50, inscritos: 30, estado: 'Próximo', descripcion: 'Seminario intensivo para líderes de célula' },
];

export const cumpleanos = [
  { nombre: 'María González', fecha: '07 Mar', foto: '' },
  { nombre: 'Santiago Morales', fecha: '10 Mar', foto: '' },
  { nombre: 'Isabella Mendoza', fecha: '15 Mar', foto: '' },
  { nombre: 'Andrés Rodríguez', fecha: '22 Mar', foto: '' },
];

export const asistenciaSemanal = [
  { semana: 'Sem 1', asistencia: 580 },
  { semana: 'Sem 2', asistencia: 620 },
  { semana: 'Sem 3', asistencia: 550 },
  { semana: 'Sem 4', asistencia: 610 },
  { semana: 'Sem 5', asistencia: 640 },
  { semana: 'Sem 6', asistencia: 600 },
  { semana: 'Sem 7', asistencia: 590 },
  { semana: 'Sem 8', asistencia: 650 },
];

export const ingresosMensuales = [
  { mes: 'Sep', ingresos: 12500000, gastos: 8200000 },
  { mes: 'Oct', ingresos: 14200000, gastos: 9100000 },
  { mes: 'Nov', ingresos: 13800000, gastos: 8500000 },
  { mes: 'Dic', ingresos: 18500000, gastos: 12000000 },
  { mes: 'Ene', ingresos: 11200000, gastos: 7800000 },
  { mes: 'Feb', ingresos: 13600000, gastos: 9400000 },
];
