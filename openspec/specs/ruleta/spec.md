# Ruleta Specification

## Purpose

Permite decidir al azar entre opciones personalizadas con una ruleta efímera, sin cuentas ni persistencia, pensada para usar una vez en el móvil.

## Requirements

### Requirement: Gestión manual de opciones
El sistema SHALL permitir crear, editar y eliminar opciones de texto libre en español.

#### Scenario: Añadir opción manual
- **WHEN** el usuario escribe "Paella" y pulsa añadir
- **THEN** "Paella" aparece en la lista y en la ruleta con 2-100 opciones como máximo operativo

#### Scenario: Editar y borrar
- **WHEN** el usuario edita "Paella" a "Paella valenciana" o la borra
- **THEN** la lista y la ruleta se actualizan inmediatamente sin recargar

#### Scenario: Pegar lista
- **WHEN** el usuario pega texto multilínea con 5 platos
- **THEN** el sistema crea 5 opciones, una por línea no vacía, recortando espacios

### Requirement: Giro aleatorio justo
El sistema SHALL elegir una opción ganadora con distribución uniforme y mostrarla de forma inequívoca.

#### Scenario: Giro básico
- **WHEN** hay >=2 opciones y el usuario pulsa Girar
- **THEN** la ruleta anima el giro, decelera y resalta una única ganadora con su nombre legible

#### Scenario: Giro bloqueado con pocas opciones
- **WHEN** hay <2 opciones
- **THEN** el botón Girar está deshabilitado y se explica "añade al menos 2 opciones"

#### Scenario: Repetibilidad
- **WHEN** el usuario pulsa Girar 2 veces seguidas sin cambiar la lista
- **THEN** cada giro es independiente y permite volver a girar sin perder la lista

### Requirement: Sesión efímera anónima
El sistema SHALL funcionar sin login y perder el estado al cerrar la sesión.

#### Scenario: Sin cuentas
- **WHEN** el usuario abre la PWA
- **THEN** accede directamente a la ruleta sin login, registro ni tracking

#### Scenario: Olvido al cerrar
- **WHEN** el usuario cierra la pestaña o PWA
- **THEN** no se conserva ninguna opción en servidor (solo memoria de la sesión, opcional sessionStorage), verificable recargando en limpio
