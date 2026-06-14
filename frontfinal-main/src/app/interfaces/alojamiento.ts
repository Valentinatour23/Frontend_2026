/**
 * Interfaz que define la estructura de un Alojamiento (Bungalow)
 */
export interface Alojamiento {
    // El ID único que viene de la base de datos MySQL
    id_alojamiento: number;
    
    nombre: string;
    
    // El precio o costo base que definiste para este alojamiento
    monto_total: number;
}
export interface Alojamiento {
    id_alojamiento: number;
    nombre: string;
    nombre_alojamiento: string;
    monto_total: number;
}