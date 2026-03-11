export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      asistencia: {
        Row: {
          created_at: string
          id: string
          persona_id: string
          presente: boolean
          servicio_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          persona_id: string
          presente?: boolean
          servicio_id: string
        }
        Update: {
          created_at?: string
          id?: string
          persona_id?: string
          presente?: boolean
          servicio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asistencia_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_financieras: {
        Row: {
          created_at: string
          id: string
          nombre: string
          tipo: Database["public"]["Enums"]["tipo_finanza"]
        }
        Insert: {
          created_at?: string
          id?: string
          nombre: string
          tipo: Database["public"]["Enums"]["tipo_finanza"]
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          tipo?: Database["public"]["Enums"]["tipo_finanza"]
        }
        Relationships: []
      }
      certificados: {
        Row: {
          codigo: string
          created_at: string
          curso_id: string
          fecha_emision: string
          id: string
          matricula_id: string
          persona_id: string
        }
        Insert: {
          codigo?: string
          created_at?: string
          curso_id: string
          fecha_emision?: string
          id?: string
          matricula_id: string
          persona_id: string
        }
        Update: {
          codigo?: string
          created_at?: string
          curso_id?: string
          fecha_emision?: string
          id?: string
          matricula_id?: string
          persona_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificados_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificados_matricula_id_fkey"
            columns: ["matricula_id"]
            isOneToOne: true
            referencedRelation: "matriculas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificados_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracion_iglesia: {
        Row: {
          ciudad: string | null
          color_primario: string | null
          created_at: string
          descripcion: string | null
          direccion: string | null
          email: string | null
          horario_servicios: string | null
          id: string
          logo_url: string | null
          moneda: string | null
          nombre_iglesia: string
          pais: string | null
          pastor_principal: string | null
          sitio_web: string | null
          telefono: string | null
          updated_at: string
          zona_horaria: string | null
        }
        Insert: {
          ciudad?: string | null
          color_primario?: string | null
          created_at?: string
          descripcion?: string | null
          direccion?: string | null
          email?: string | null
          horario_servicios?: string | null
          id?: string
          logo_url?: string | null
          moneda?: string | null
          nombre_iglesia?: string
          pais?: string | null
          pastor_principal?: string | null
          sitio_web?: string | null
          telefono?: string | null
          updated_at?: string
          zona_horaria?: string | null
        }
        Update: {
          ciudad?: string | null
          color_primario?: string | null
          created_at?: string
          descripcion?: string | null
          direccion?: string | null
          email?: string | null
          horario_servicios?: string | null
          id?: string
          logo_url?: string | null
          moneda?: string | null
          nombre_iglesia?: string
          pais?: string | null
          pastor_principal?: string | null
          sitio_web?: string | null
          telefono?: string | null
          updated_at?: string
          zona_horaria?: string | null
        }
        Relationships: []
      }
      cursos: {
        Row: {
          created_at: string
          cupos: number | null
          descripcion: string | null
          duracion_semanas: number | null
          estado: string
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          instructor: string | null
          nombre: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cupos?: number | null
          descripcion?: string | null
          duracion_semanas?: number | null
          estado?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          instructor?: string | null
          nombre: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cupos?: number | null
          descripcion?: string | null
          duracion_semanas?: number | null
          estado?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          instructor?: string | null
          nombre?: string
          updated_at?: string
        }
        Relationships: []
      }
      donaciones: {
        Row: {
          created_at: string
          descripcion: string | null
          estado: string | null
          fecha: string
          id: string
          metodo_pago: string | null
          monto: number
          persona_id: string | null
          tipo: string | null
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          estado?: string | null
          fecha?: string
          id?: string
          metodo_pago?: string | null
          monto: number
          persona_id?: string | null
          tipo?: string | null
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          estado?: string | null
          fecha?: string
          id?: string
          metodo_pago?: string | null
          monto?: number
          persona_id?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donaciones_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          created_at: string
          cupos: number | null
          descripcion: string | null
          estado: string
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          lugar: string | null
          nombre: string
          tipo: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cupos?: number | null
          descripcion?: string | null
          estado?: string
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          lugar?: string | null
          nombre: string
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cupos?: number | null
          descripcion?: string | null
          estado?: string
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          lugar?: string | null
          nombre?: string
          tipo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      finanzas: {
        Row: {
          categoria_id: string | null
          categoria_nombre: string | null
          comprobante: string | null
          created_at: string
          descripcion: string | null
          fecha: string
          id: string
          metodo_pago: string | null
          monto: number
          persona_id: string | null
          registrado_por: string | null
          tipo: Database["public"]["Enums"]["tipo_finanza"]
          updated_at: string
        }
        Insert: {
          categoria_id?: string | null
          categoria_nombre?: string | null
          comprobante?: string | null
          created_at?: string
          descripcion?: string | null
          fecha: string
          id?: string
          metodo_pago?: string | null
          monto: number
          persona_id?: string | null
          registrado_por?: string | null
          tipo: Database["public"]["Enums"]["tipo_finanza"]
          updated_at?: string
        }
        Update: {
          categoria_id?: string | null
          categoria_nombre?: string | null
          comprobante?: string | null
          created_at?: string
          descripcion?: string | null
          fecha?: string
          id?: string
          metodo_pago?: string | null
          monto?: number
          persona_id?: string | null
          registrado_por?: string | null
          tipo?: Database["public"]["Enums"]["tipo_finanza"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finanzas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_financieras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finanzas_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      grupo_miembros: {
        Row: {
          created_at: string
          grupo_id: string
          id: string
          persona_id: string
        }
        Insert: {
          created_at?: string
          grupo_id: string
          id?: string
          persona_id: string
        }
        Update: {
          created_at?: string
          grupo_id?: string
          id?: string
          persona_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grupo_miembros_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grupo_miembros_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      grupos: {
        Row: {
          created_at: string
          descripcion: string | null
          dia_reunion: string | null
          estado: string
          hora_reunion: string | null
          id: string
          latitud: number | null
          lider_id: string | null
          longitud: number | null
          nombre: string
          tipo: Database["public"]["Enums"]["tipo_grupo"]
          ubicacion: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          dia_reunion?: string | null
          estado?: string
          hora_reunion?: string | null
          id?: string
          latitud?: number | null
          lider_id?: string | null
          longitud?: number | null
          nombre: string
          tipo: Database["public"]["Enums"]["tipo_grupo"]
          ubicacion?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          dia_reunion?: string | null
          estado?: string
          hora_reunion?: string | null
          id?: string
          latitud?: number | null
          lider_id?: string | null
          longitud?: number | null
          nombre?: string
          tipo?: Database["public"]["Enums"]["tipo_grupo"]
          ubicacion?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grupos_lider_id_fkey"
            columns: ["lider_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      inscripciones: {
        Row: {
          confirmado: boolean | null
          created_at: string
          estado_pago: string | null
          evento_id: string
          id: string
          persona_id: string
        }
        Insert: {
          confirmado?: boolean | null
          created_at?: string
          estado_pago?: string | null
          evento_id: string
          id?: string
          persona_id: string
        }
        Update: {
          confirmado?: boolean | null
          created_at?: string
          estado_pago?: string | null
          evento_id?: string
          id?: string
          persona_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscripciones_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      materias: {
        Row: {
          aula: string | null
          created_at: string
          descripcion: string | null
          horario: string | null
          id: string
          maestro_nombre: string | null
          nombre: string
          periodo_id: string
        }
        Insert: {
          aula?: string | null
          created_at?: string
          descripcion?: string | null
          horario?: string | null
          id?: string
          maestro_nombre?: string | null
          nombre: string
          periodo_id: string
        }
        Update: {
          aula?: string | null
          created_at?: string
          descripcion?: string | null
          horario?: string | null
          id?: string
          maestro_nombre?: string | null
          nombre?: string
          periodo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "materias_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "periodos_academicos"
            referencedColumns: ["id"]
          },
        ]
      }
      matriculas: {
        Row: {
          created_at: string
          curso_id: string
          estado: string
          fecha_matricula: string
          id: string
          materia_id: string | null
          nota_final: number | null
          periodo_id: string | null
          persona_id: string
        }
        Insert: {
          created_at?: string
          curso_id: string
          estado?: string
          fecha_matricula?: string
          id?: string
          materia_id?: string | null
          nota_final?: number | null
          periodo_id?: string | null
          persona_id: string
        }
        Update: {
          created_at?: string
          curso_id?: string
          estado?: string
          fecha_matricula?: string
          id?: string
          materia_id?: string | null
          nota_final?: number | null
          periodo_id?: string | null
          persona_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matriculas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matriculas_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matriculas_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "periodos_academicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matriculas_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      periodos_academicos: {
        Row: {
          created_at: string
          escuela_id: string
          estado: string
          fecha_fin: string | null
          fecha_inicio: string | null
          fecha_matricula_fin: string | null
          fecha_matricula_inicio: string | null
          id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          escuela_id: string
          estado?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          fecha_matricula_fin?: string | null
          fecha_matricula_inicio?: string | null
          id?: string
          nombre: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          escuela_id?: string
          estado?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          fecha_matricula_fin?: string | null
          fecha_matricula_inicio?: string | null
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "periodos_academicos_escuela_id_fkey"
            columns: ["escuela_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      persona_procesos: {
        Row: {
          created_at: string
          estado: string
          fecha_completado: string | null
          id: string
          persona_id: string
          proceso_id: string
        }
        Insert: {
          created_at?: string
          estado?: string
          fecha_completado?: string | null
          id?: string
          persona_id: string
          proceso_id: string
        }
        Update: {
          created_at?: string
          estado?: string
          fecha_completado?: string | null
          id?: string
          persona_id?: string
          proceso_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "persona_procesos_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_procesos_proceso_id_fkey"
            columns: ["proceso_id"]
            isOneToOne: false
            referencedRelation: "procesos_crecimiento"
            referencedColumns: ["id"]
          },
        ]
      }
      personas: {
        Row: {
          apellidos: string
          created_at: string
          direccion: string | null
          documento: string | null
          email: string | null
          estado_civil: string | null
          estado_iglesia: Database["public"]["Enums"]["estado_iglesia"]
          fecha_bautismo: string | null
          fecha_conversion: string | null
          fecha_ingreso: string | null
          fecha_nacimiento: string | null
          foto_url: string | null
          grupo_id: string | null
          id: string
          lider_responsable: string | null
          ministerio: string | null
          nombres: string
          observaciones: string | null
          ocupacion: string | null
          sexo: string | null
          telefono: string | null
          tipo_persona: Database["public"]["Enums"]["tipo_persona"]
          updated_at: string
        }
        Insert: {
          apellidos: string
          created_at?: string
          direccion?: string | null
          documento?: string | null
          email?: string | null
          estado_civil?: string | null
          estado_iglesia?: Database["public"]["Enums"]["estado_iglesia"]
          fecha_bautismo?: string | null
          fecha_conversion?: string | null
          fecha_ingreso?: string | null
          fecha_nacimiento?: string | null
          foto_url?: string | null
          grupo_id?: string | null
          id?: string
          lider_responsable?: string | null
          ministerio?: string | null
          nombres: string
          observaciones?: string | null
          ocupacion?: string | null
          sexo?: string | null
          telefono?: string | null
          tipo_persona?: Database["public"]["Enums"]["tipo_persona"]
          updated_at?: string
        }
        Update: {
          apellidos?: string
          created_at?: string
          direccion?: string | null
          documento?: string | null
          email?: string | null
          estado_civil?: string | null
          estado_iglesia?: Database["public"]["Enums"]["estado_iglesia"]
          fecha_bautismo?: string | null
          fecha_conversion?: string | null
          fecha_ingreso?: string | null
          fecha_nacimiento?: string | null
          foto_url?: string | null
          grupo_id?: string | null
          id?: string
          lider_responsable?: string | null
          ministerio?: string | null
          nombres?: string
          observaciones?: string | null
          ocupacion?: string | null
          sexo?: string | null
          telefono?: string | null
          tipo_persona?: Database["public"]["Enums"]["tipo_persona"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_personas_grupo"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      peticiones_oracion: {
        Row: {
          created_at: string
          descripcion: string | null
          estado: string
          fecha_respuesta: string | null
          fecha_seguimiento: string | null
          id: string
          notas_seguimiento: string | null
          persona_id: string | null
          prioridad: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          estado?: string
          fecha_respuesta?: string | null
          fecha_seguimiento?: string | null
          id?: string
          notas_seguimiento?: string | null
          persona_id?: string | null
          prioridad?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          estado?: string
          fecha_respuesta?: string | null
          fecha_seguimiento?: string | null
          id?: string
          notas_seguimiento?: string | null
          persona_id?: string | null
          prioridad?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "peticiones_oracion_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      procesos_crecimiento: {
        Row: {
          created_at: string
          id: string
          nombre: string
          orden: number
        }
        Insert: {
          created_at?: string
          id?: string
          nombre: string
          orden?: number
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      relaciones_familiares: {
        Row: {
          created_at: string
          familiar_id: string | null
          familiar_nombre: string | null
          id: string
          parentesco: string
          persona_id: string
        }
        Insert: {
          created_at?: string
          familiar_id?: string | null
          familiar_nombre?: string | null
          id?: string
          parentesco: string
          persona_id: string
        }
        Update: {
          created_at?: string
          familiar_id?: string | null
          familiar_nombre?: string | null
          id?: string
          parentesco?: string
          persona_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relaciones_familiares_familiar_id_fkey"
            columns: ["familiar_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relaciones_familiares_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      reporte_asistencia: {
        Row: {
          created_at: string
          es_nuevo: boolean
          id: string
          motivo_ausencia: string | null
          persona_id: string
          presente: boolean
          reporte_id: string
        }
        Insert: {
          created_at?: string
          es_nuevo?: boolean
          id?: string
          motivo_ausencia?: string | null
          persona_id: string
          presente?: boolean
          reporte_id: string
        }
        Update: {
          created_at?: string
          es_nuevo?: boolean
          id?: string
          motivo_ausencia?: string | null
          persona_id?: string
          presente?: boolean
          reporte_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reporte_asistencia_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reporte_asistencia_reporte_id_fkey"
            columns: ["reporte_id"]
            isOneToOne: false
            referencedRelation: "reportes_grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      reportes_grupos: {
        Row: {
          created_at: string
          estado: string
          fecha: string
          fecha_verificacion: string | null
          grupo_id: string
          id: string
          ingreso_verificado_sobre: number | null
          lider_id: string | null
          mensaje: string
          observaciones: string | null
          ofrenda_casa_paz: number | null
          total_reportado: number | null
          updated_at: string
          verificado_por: string | null
        }
        Insert: {
          created_at?: string
          estado?: string
          fecha?: string
          fecha_verificacion?: string | null
          grupo_id: string
          id?: string
          ingreso_verificado_sobre?: number | null
          lider_id?: string | null
          mensaje?: string
          observaciones?: string | null
          ofrenda_casa_paz?: number | null
          total_reportado?: number | null
          updated_at?: string
          verificado_por?: string | null
        }
        Update: {
          created_at?: string
          estado?: string
          fecha?: string
          fecha_verificacion?: string | null
          grupo_id?: string
          id?: string
          ingreso_verificado_sobre?: number | null
          lider_id?: string | null
          mensaje?: string
          observaciones?: string | null
          ofrenda_casa_paz?: number | null
          total_reportado?: number | null
          updated_at?: string
          verificado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reportes_grupos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      servicios: {
        Row: {
          created_at: string
          descripcion: string | null
          estado: string
          fecha: string
          hora: string | null
          id: string
          lugar: string | null
          nombre: string
          predicador: string | null
          tipo: Database["public"]["Enums"]["tipo_servicio"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          estado?: string
          fecha: string
          hora?: string | null
          id?: string
          lugar?: string | null
          nombre: string
          predicador?: string | null
          tipo: Database["public"]["Enums"]["tipo_servicio"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          estado?: string
          fecha?: string
          hora?: string | null
          id?: string
          lugar?: string | null
          nombre?: string
          predicador?: string | null
          tipo?: Database["public"]["Enums"]["tipo_servicio"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "pastor"
        | "lider"
        | "secretaria"
        | "tesoreria"
        | "maestro"
        | "consulta"
      estado_iglesia: "Activo" | "Inactivo" | "En proceso"
      tipo_finanza: "Ingreso" | "Gasto"
      tipo_grupo:
        | "Células"
        | "Jóvenes"
        | "Mujeres"
        | "Hombres"
        | "Niños"
        | "Alabanza"
        | "Ujieres"
        | "Liderazgo"
        | "Discipulado"
      tipo_persona: "Miembro" | "Visitante" | "Líder" | "Servidor"
      tipo_servicio:
        | "Culto general"
        | "Oración"
        | "Reunión de líderes"
        | "Escuela bíblica"
        | "Vigilia"
        | "Servicio especial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "pastor",
        "lider",
        "secretaria",
        "tesoreria",
        "maestro",
        "consulta",
      ],
      estado_iglesia: ["Activo", "Inactivo", "En proceso"],
      tipo_finanza: ["Ingreso", "Gasto"],
      tipo_grupo: [
        "Células",
        "Jóvenes",
        "Mujeres",
        "Hombres",
        "Niños",
        "Alabanza",
        "Ujieres",
        "Liderazgo",
        "Discipulado",
      ],
      tipo_persona: ["Miembro", "Visitante", "Líder", "Servidor"],
      tipo_servicio: [
        "Culto general",
        "Oración",
        "Reunión de líderes",
        "Escuela bíblica",
        "Vigilia",
        "Servicio especial",
      ],
    },
  },
} as const
