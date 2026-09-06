"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"

export type Language = "es" | "en"

const translations: Record<string, string> = {
  // Navegación y común
  Dashboard: "Inicio",
  Analytics: "Análisis",
  Transactions: "Movimientos",
  Invoices: "Facturas",
  Payments: "Pagos",
  Members: "Miembros",
  Permissions: "Permisos",
  Chat: "Chat",
  Settings: "Configuración",
  Help: "Ayuda",
  Home: "Inicio",
  Profile: "Perfil",
  "Log out": "Cerrar sesión",
  Reset: "Restablecer",
  "All categories": "Todas las categorías",
  Categories: "Categorías",
  "Add category": "Añadir categoría",
  "Category name": "Nombre de categoría",
  Default: "Por defecto",
  Show: "Mostrar",
  Hide: "Ocultar",
  Add: "Añadir",
  Save: "Guardar",
  Send: "Enviar",
  Request: "Solicitar",
  More: "Más",
  Delete: "Eliminar",
  "Add manual transaction": "Añadir transacción manual",
  "Type": "Tipo",
  "Date": "Fecha",
  "Concept": "Concepto",
  "Cancel": "Cancelar",
  "Transaction added": "Transacción añadida",
  "Please enter a valid amount": "Introduce un importe válido",
  "Please select a date": "Selecciona una fecha",
  "Monthly average": "Media mensual",
  January: "Enero",
  February: "Febrero",
  March: "Marzo",
  April: "Abril",
  May: "Mayo",
  June: "Junio",
  July: "Julio",
  August: "Agosto",
  September: "Septiembre",
  October: "Octubre",
  November: "Noviembre",
  December: "Diciembre",
  Back: "Atrás",
  Continue: "Continuar",
  Close: "Cerrar",
  Pay: "Pagar",
  Download: "Descargar",
  Print: "Imprimir",

  // Notificaciones (campana)
  Notifications: "Notificaciones",
  "Close notifications": "Cerrar notificaciones",
  "New Feature": "Nueva función",
  "Check out our new budget tracking tool!": "¡Descubre nuestra nueva herramienta de seguimiento presupuestario!",
  "Account Alert": "Alerta de cuenta",
  "Unusual activity detected on your account.": "Se ha detectado actividad inusual en tu cuenta.",
  "Payment Due": "Pago pendiente",
  "Your credit card payment is due in 3 days.": "El pago de tu tarjeta de crédito vence en 3 días.",
  "Investment Update": "Actualización de inversiones",
  "Your investment portfolio has grown by 5% this month.": "Tu cartera de inversión ha crecido un 5% este mes.",
  "New Offer": "Nueva oferta",
  "You're eligible for a new savings account with higher interest!":
    "¡Eres elegible para una nueva cuenta de ahorros con mayor interés!",

  // Resumen de cuentas
  "Accounts Overview": "Resumen de cuentas",
  "Total balance across all accounts": "Saldo total de todas las cuentas",
  Checking: "Corriente",
  "Savings/Investment": "Ahorro/Inversión",
  "Savings and Investment": "Ahorro e Inversión",
  Debt: "Deuda",
  "Total Income": "Total ingresos",
  "Average Income": "Media Ingresos",
  "Total Expenses": "Total gastos",
  "Average Expenses": "Media Gastos",

  // Modales de dinero
  Amount: "Importe",
  "Card Details": "Datos de la tarjeta",
  "OTP Verification": "Verificación OTP",
  Confirmation: "Confirmación",
  "Amount and Account": "Importe y cuenta",
  "Amount to Add": "Importe a añadir",
  "Amount to Send": "Importe a enviar",
  "Amount to Request": "Importe a solicitar",
  "Enter amount": "Introduce el importe",
  "Select Contact": "Seleccionar contacto",
  "Enter Amount": "Introducir importe",
  "Select a contact": "Selecciona un contacto",
  "Contact Details:": "Datos del contacto:",
  "Name:": "Nombre:",
  "ID:": "ID:",
  "Phone:": "Teléfono:",
  "From Account": "Desde la cuenta",
  "Select account": "Selecciona una cuenta",
  "Card Number": "Número de tarjeta",
  "Expiry Date": "Fecha de caducidad",
  "Enter the OTP sent to your registered mobile number":
    "Introduce el OTP enviado a tu número de móvil registrado",
  "Enter OTP": "Introduce el OTP",
  "Money Added Successfully": "Dinero añadido correctamente",
  "has been added to your Checking account.": "se ha añadido a tu cuenta Corriente.",
  "Money Sent Successfully": "Dinero enviado correctamente",
  "has been sent from your": "se ha enviado desde tu",
  "account.": ".",
  "Money Request Sent": "Solicitud enviada",
  "has been requested from": "se ha solicitado a",
  "Payment Option": "Opción de pago",
  "Pay in full": "Pagar el total",
  "Pay in 4": "Pagar en 4 plazos",
  "Payment Successful": "Pago realizado con éxito",
  "Your payment of": "Tu pago de",
  for: "para",
  "has been processed successfully.": "se ha procesado correctamente.",

  // Transacciones recientes
  "Recent Transactions": "Transacciones recientes",
  "View All Transactions": "Ver todos los movimientos",
  "All Transactions": "Todos los movimientos",
  "Income": "Ingreso",
  "Expense": "Gasto",
  "No transactions yet": "Aún no hay transacciones",
  "Amazon.com": "Amazon.com",
  "Whole Foods Market": "Whole Foods Market",
  "Netflix Subscription": "Suscripción de Netflix",
  "Freelance Payment": "Pago freelance",
  "Gas Station": "Gasolinera",

  // Pago rápido de facturas
  "Quick Bill Pay": "Recibos",
  "Provider:": "Proveedor:",
  "No pending bills": "No hay recibos pendientes",
  "Electricity Bill": "Factura de electricidad",
  "Internet Service": "Factura de internet",
  "Subscriptions": "Suscripciones",
  "Invoices": "Facturas",
  "Add Invoice": "Añadir Factura",
  "Invoice type": "Tipo de factura",
  "Internet Bill": "Factura de internet",
  "Other": "Otros",
  "Payment date": "Fecha de pago",
  "No invoices yet": "Todavía no hay facturas",
  "Invoice added": "Factura añadida",
  "Import file (.pdf)": "Importar archivo (.pdf)",
  "File required in .pdf format": "Archivo necesario en formato .pdf",
  "Only PDF files are allowed": "Solo se permiten archivos .pdf",
  "Could not save the file": "No se pudo guardar el archivo",
  "Download invoice": "Descargar factura",
  "File not found": "Archivo no encontrado",
  "Income Breakdown": "Desglose de ingresos",
  "Salary": "Nómina",
  "Transfers": "Transferencias",
  "Bizum": "Bizum",
  "History": "Historial",
  "Months": "Meses",
  "Annual Breakdown": "Desglose anual",
  Movements: "Movimientos",
  "Average per day": "Media por día",
  "Monthly Remainder": "Resto mensual",
  "Total Investment": "Total inversión",
  "from last month": "desde el mes pasado",
  "Monthly Income": "Ingresos del mes",
  "Savings Rate": "Tasa de ahorro",
  "Savings of the month": "Ahorro del mes",
  "You spend more than you earn": "Estás gastando más de lo que ingresas",
  "Top Expenses": "Mayores gastos",
  "Net Worth": "Patrimonio",
  Cash: "Efectivo",
  Invested: "Invertido",
  "Available to spend": "Disponible para gastar",
  "Investment portfolio": "Cartera de inversión",
  "vs last month": "vs mes pasado",
  "Savings this month": "Ahorro este mes",
  "Total wealth": "Patrimonio total",
  "Checking account": "Cuenta corriente",
  "Invested portfolio": "Cartera invertida",
  "Savings by month": "Ahorro por mes",
  "Financial news": "Noticias financieras",
  "News error": "No se han podido cargar las noticias",
  "Loading news": "Cargando noticias…",
  "Investment tips": "Consejos para invertir",
  "Emergency fund": "Fondo de emergencia",
  "Emergency fund tip": "Cubre entre 3 y 6 meses de gastos en efectivo antes de mover dinero a inversiones.",
  Diversify: "Diversifica",
  "Diversify tip": "Reparte entre renta variable, renta fija y sectores distintos: diversificar reduce el riesgo de tu cartera.",
  "Long horizon": "Horizonte a largo plazo",
  "Long horizon tip": "Invertir es un maratón, no un esprín. Mantén la calma en los vaivenes del mercado y evita entrar y salir a menudo.",
  "Steady investing": "Inversión periódica",
  "Steady investing tip": "Aportar una cantidad fija cada mes (estrategia DCA) suaviza el precio medio de entrada en el mercado.",
  Compounding: "Interés compuesto",
  "Compounding tip": "Cuanto antes empieces, más tiempo trabaja el interés compuesto a tu favor: es la fuerza más poderosa en inversión.",
  Fees: "Las comisiones importan",
  "Fees tip": "Una comisión del 1% anual puede restar mucho en veinte años. Compara siempre los gastos de gestión de tus inversiones.",
  "Savings breakdown note": "El patrimonio es todo tu dinero: el efectivo del que dispones ahora más lo que tienes invertido.",
  "Income tips": "Consejos sobre ingresos",
  "Extra pay tip": "Paga extra y pagas dobles",
  "Extra pay tip desc": "Si cobras 14 pagas, junio y diciembre multiplican tus ingresos. No los incorpores al presupuesto mensual: manda el extra directo a ahorro o deuda para que no se diluya.",
  "IRPF withholding tip": "Revisa tu retención de IRPF",
  "IRPF withholding tip desc": "Una gran devolución en la Renta significa que has financiado gratis a Hacienda durante todo el año. Ajusta la retención de tu nómina para acercarte al impuesto real que te toca pagar.",
  "One-off income tip": "Los ingresos puntuales no son un sueldo",
  "One-off income tip desc": "Las transferencias y Bizum esporádicos (ventas, regalos, reembolsos) no se repiten cada mes. Presupuesta solo tus ingresos recurrentes y trata el resto como un extra.",
  "Social security base tip": "Tu base de cotización importa",
  "Social security base tip desc": "La base de cotización de tu nómina determina la prestación por desempleo, la baja y tu futura pensión. Compruébala de vez en cuando en «Tu Seguridad Social» para asegurarte de que cotizas por tu salario real.",
  "Overtime tip": "Horas extra: ¿dinero o descanso?",
  "Overtime tip desc": "Las horas extraordinarias tributan en los tramos altos del IRPF. Si tu empresa permite compensarlas con descanso en los cuatro meses siguientes, suele salir más a cuenta.",
  "Interest income tip": "Los intereses también son ingresos",
  "Interest income tip desc": "El interés de depósitos y cuentas remuneradas es un ingreso y tributa en el IRPF (tramo del ahorro, 19-28%). Anótalo aparte y debes declararlo en la Renta.",
  "Month Projection": "Proyección del mes",
  "Daily average expense": "Gasto medio diario",
  "Projected monthly expenses": "Gasto previsto del mes",
  "Projected result": "Resultado previsto",
  "You will spend": "Gastarás el",
  "of your income": "de tus ingresos",
  available: "disponible",
  "You will end the month with": "Acabarás el mes con",
  "if nothing changes": "si nada cambia",
  "At risk of overspending": "Vas camino de gastar más de lo que ingresas",
  Day: "Día",
  "of the month": "del mes",
  "If you keep this pace": "Si sigues este ritmo",
  "Period comparison": "Comparativa con el mes anterior",
  "Period": "Periodo",
  "Previous period": "Periodo anterior",
  "Sign in": "Iniciar sesión",
  "Create account": "Crear cuenta",
  Password: "Contraseña",
  "Enter your email and password to access your data":
    "Introduce tu correo y contraseña para acceder a tus datos",
  "Choose an email and password for the new account":
    "Elige un correo y una contraseña para la nueva cuenta",
  "No account exists with this email": "No existe una cuenta con ese correo",
  "Incorrect password": "Contraseña incorrecta",
  "This account already exists": "Ya existe una cuenta con ese correo",
  "Invalid email": "Introduce un correo válido",
  "Password must be at least 4 characters": "La contraseña debe tener al menos 4 caracteres",
  "Don't have an account? Create one": "¿No tienes cuenta? Crear una",
  "Already have an account? Sign in": "¿Ya tienes cuenta? Iniciar sesión",
  "Sign up": "Registrarse",
  "Create your account": "Crea tu cuenta",
  "Email address": "Correo electrónico",
  "Enter your email": "Introduce tu correo",
  "Enter your password": "Introduce tu contraseña",
  "Enter your date of birth": "Introduce tu fecha de nacimiento",
  "You must be at least 18 years old": "Debes tener al menos 18 años",
  "Verification code": "Código de verificación",
  "Enter the code we sent to": "Introduce el código que enviamos a",
  "Verify account": "Verificar cuenta",
  "Verify": "Verificar",
  "I need a new code": "Necesito un código nuevo",
  "Resend code": "Reenviar código",
  "First name": "Nombre",
  Surname: "Apellidos",
  Age: "Edad",
  "Date of Birth": "Fecha de nacimiento",
  "End-to-end encrypted": "Conexión cifrada de extremo a extremo",
  Summary: "Resumen",
  Difference: "Diferencia",
  "Confirm password": "Confirmar contraseña",
  "Passwords do not match": "Las contraseñas no coinciden",
  "Please enter your name and surname": "Introduce tu nombre y apellidos",
  "Enter a valid age": "Introduce una edad válida",
  Totals: "Totales",
  "Expense Breakdown": "Desglose de gastos",
  "Expense Types": "Tipos de gasto",
  "Expense Movements": "Movimientos de gastos",
  Budget: "Presupuesto",
  Spent: "Gastado",
  "Where did the money go?": "¿Dónde se fue el dinero?",
  "Compared to last month": "Frente al mes pasado",
  "more than last month": "más que el mes pasado",
  "less than last month": "menos que el mes pasado",
  "First complete month here": "Primer mes con datos",
  "Over budget alert": "Sobre presupuesto",
  "over the budget": "por encima del presupuesto",
  "Under budget": "Bajo control",
  "No budget exceeded this month": "Ningún presupuesto superado este mes",
  "Set budgets": "Sin presupuestos",
  "Set budgets invite": "Configura presupuestos en la tarjeta de abajo para controlar mejor tus gastos",
  Tip: "Consejo",
  "Biggest opportunity": "Tu mayor oportunidad de ahorro está en",
  "of your spending": "de tus gastos",
  Electricity: "Luz",
  Water: "Agua",
  Internet: "Internet",
  "Other Expenses": "Otros gastos",
  "Rent/Mortgage": "Alquiler/Hipoteca",
  Groceries: "Alimentación",
  Car: "Coche",
  Transport: "Transporte",
  Shopping: "Compras",
  "Dining Out": "Comer fuera",
  Leisure: "Ocio",
  Fuel: "Gasolina",
  Insurance: "Seguros",
  Health: "Salud",
  Education: "Educación",
  Clothing: "Ropa",
  Home: "Hogar",
  Travel: "Viajes",
  Gifts: "Regalos",
  Pets: "Mascota",
  Sport: "Deporte",
  ATM: "Cajero",
  "Investment Portfolio": "Cartera de inversión",
  "Import Portfolio": "Importar portfolio",
  Product: "Producto",
  ISIN: "ISIN",
  Exchange: "Bolsa",
  Quantity: "Cantidad",
  Price: "Precio",
  Total: "Total",
  "Day +/-": "Día +/-",
  "Last updated": "Última actualización",
  "No assets imported yet": "Todavía no has importado ningún activo",
  Refresh: "Actualizar",
  Live: "En directo",
  "Market closed": "Mercado cerrado",
  "Opens at": "abre",
  "No trades": "Sin operaciones por ahora",
  "Real-time streaming quotes": "Cotizaciones en streaming en tiempo real",
  "Quotes may be delayed up to 15 minutes":
    "Las cotizaciones pueden ir con un retardo de hasta 15 minutos",
  "Total Salary": "Total Nómina",
  "Total Transfers": "Total Transferencias",
  "Total Bizums": "Total Bizums",
  "Write a message": "Escribe un mensaje",
  "No messages yet": "Todavía no hay mensajes",
  "Dismiss": "Descartar",
  "AI is typing": "Escribiendo…",
  "AI assistant unavailable": "El asistente de IA no está disponible. Inténtalo de nuevo.",
  "AI assistant unconfigured":
    "Falta la clave de IA (GEMINI_API_KEY) en el servidor. Pídela en https://aistudio.google.com/apikey y añádela en Vercel." ,
  "AI response was cut off":
    "La respuesta se ha cortado por el límite de longitud",
  "Continue": "Continuar",
  "Notes": "Notas",
  "Add a note": "Añade una nota",
  "No notes yet": "Todavía no hay notas",
  "Water Bill": "Factura de agua",

  // Extracto bancario (Norma 43)
  "Add bank statement": "Añadir extracto del banco",
  "movements imported": "movimientos importados",
  "No expenses found in the file": "No se han encontrado movimientos en el archivo",
  "Error reading the file": "Error al leer el archivo",

  // Métricas de negocio
  "Breakdown": "Desglose",
  "Expenses": "Gastos",
  "View Details": "Ver detalles",
  "Revenue": "Ingresos",
  "Monthly revenue target": "Objetivo mensual de ingresos",
  "On Track": "En camino",
  Behind: "Retrasado",
  Ahead: "Por delante",
  "Customer Acquisition": "Gastos",
  "New customers this quarter": "Nuevos clientes este trimestre",
  "Average Order Value": "Ahorro/Inversión",
  "Target AOV for Q3": "Objetivo de TPM para el T3",
  "% complete": "% completado",

  // Analíticas
  "Export Data": "Exportar datos",
  "Import data": "Importar datos",
  Overview: "Vista general",
  Reports: "Informes",
  "Pick a date": "Elige una fecha",
  "Dashboard Overview": "Vista general del panel",
  "Compare to:": "Comparar con:",
  "Select period": "Selecciona un período",
  "Previous Month": "Mes anterior",
  "Previous Quarter": "Trimestre anterior",
  "Previous Year": "Año anterior",
  Revenue: "Ingresos",
  "Account Growth": "Crecimiento de cuentas",
  "Top Products": "Productos principales",
  "User Activity": "Actividad de usuarios",
  "Detailed Analytics": "Analíticas detalladas",
  "Last 7 Days": "Últimos 7 días",
  "Last 30 Days": "Últimos 30 días",
  "Last 90 Days": "Últimos 90 días",
  "Last 12 Months": "Últimos 12 meses",
  "Customer Segmentation": "Segmentación de clientes",
  "High Value": "Alto valor",
  "Medium Value": "Valor medio",
  "Low Value": "Bajo valor",
  "At Risk": "En riesgo",
  Lost: "Perdido",
  "Customer Retention Rate": "Tasa de retención de clientes",
  "Channel Performance": "Rendimiento por canal",
  Direct: "Directo",
  "Organic Search": "Búsqueda orgánica",
  "Paid Search": "Búsqueda de pago",
  "Social Media": "Redes sociales",
  Email: "Correo electrónico",
  "Key Metrics": "Métricas clave",
  "Customer Lifetime Value": "Valor de vida del cliente",
  "Net Promoter Score": "Puntuación NPS",
  "Customer Acquisition Cost": "Coste de adquisición de clientes",

  // Informes
  "Generate Report": "Generar informe",
  Report: "Informe",
  "Financial Summary": "Resumen financiero",
  "Product Performance": "Rendimiento de productos",
  "Risk Assessment": "Evaluación de riesgos",
  "Marketing Campaign Analysis": "Análisis de campañas de marketing",
  "Operational Efficiency": "Eficiencia operativa",
  "Select report type": "Selecciona el tipo de informe",
  Metric: "Métrica",
  Value: "Valor",
  "Total Revenue": "Ingresos totales",
  "Net Profit": "Beneficio neto",
  "Operating Expenses": "Gastos operativos",
  "Gross Margin": "Margen bruto",
  "Return on Investment": "Retorno de la inversión",
  "New Customers": "Nuevos clientes",
  "Conversion Rate": "Tasa de conversión",
  "Churn Rate": "Tasa de cancelación",
  "Financial Summary Report": "Informe de resumen financiero",
  "Customer Acquisition Report": "Informe de gastos",

  // Preferencias de notificación (analíticas)
  "Notification Preferences": "Preferencias de notificación",
  "Security Alerts": "Alertas de seguridad",
  "Performance Updates": "Actualizaciones de rendimiento",
  "Market Trends": "Tendencias del mercado",
  "Financial Reports": "Informes financieros",
  "User Behavior": "Comportamiento de usuarios",
  "Account Activity": "Actividad de la cuenta",
  "Recent Notifications": "Notificaciones recientes",
  "Unusual account activity detected": "Actividad inusual detectada en la cuenta",
  "2 hours ago": "Hace 2 horas",
  "1 day ago": "Hace 1 día",
  "3 days ago": "Hace 3 días",
  "5 days ago": "Hace 5 días",
  "Your portfolio has grown by 5% this week": "Tu cartera ha crecido un 5% esta semana",
  "New feature: Advanced analytics now available": "Nueva función: analíticas avanzadas ya disponibles",
  "Monthly financial report is ready for review": "El informe financiero mensual está listo para revisión",
  "View All Notifications": "Ver todas las notificaciones",

  // Tarjetas de vista general
  "+20.1% from last month": "+20,1% desde el mes pasado",
  "+180.1% from last month": "+180,1% desde el mes pasado",
  "+19% from last month": "+19% desde el mes pasado",
  "+5.4% from last month": "+5,4% desde el mes pasado",
  "Active Accounts": "Cuentas activas",
  "Growth Rate": "Tasa de crecimiento",

  // Productos principales
  "Savings Account": "Cuenta de ahorros",
  "Credit Card": "Tarjeta de crédito",
  "Personal Loan": "Préstamo personal",
  Mortgage: "Hipoteca",
  "Investment Fund": "Fondo de inversión",

  // Actividad de usuarios
  "Logged in": "Ha iniciado sesión",
  "Updated profile": "Actualizó su perfil",
  "Made a transfer": "Realizó una transferencia",
  "Opened new account": "Abrió una cuenta nueva",
  "2 minutes ago": "Hace 2 minutos",
  "10 minutes ago": "Hace 10 minutos",
  "15 minutes ago": "Hace 15 minutos",
  "30 minutes ago": "Hace 30 minutos",

  // Crecimiento de cuentas
  "New Accounts:": "Cuentas nuevas:",
  "Total Accounts:": "Cuentas totales:",
  Jan: "Ene",
  Feb: "Feb",
  Mar: "Mar",
  Apr: "Abr",
  Jun: "Jun",

  // Configuración
  Account: "Cuenta",
  Security: "Seguridad",
  Preferences: "Preferencias",
  Privacy: "Privacidad",
  Email: "Correo electrónico",
  "Select Language": "Selecciona el idioma",
  "Select Currency": "Selecciona la moneda",
  "Select Date Format": "Selecciona el formato de fecha",
  "Select Frequency": "Selecciona la frecuencia",

  // Zonas horarias
  "International Date Line West (UTC-12)": "Línea internacional de cambio de fecha oeste (UTC-12)",
  "Samoa Standard Time (UTC-11)": "Hora estándar de Samoa (UTC-11)",
  "Hawaii-Aleutian Standard Time (UTC-10)": "Hora estándar de Hawái-Aleutianas (UTC-10)",
  "Alaska Standard Time (UTC-9)": "Hora estándar de Alaska (UTC-9)",
  "Pacific Time (UTC-8)": "Hora del Pacífico (UTC-8)",
  "Mountain Time (UTC-7)": "Hora de la Montaña (UTC-7)",
  "Central Time (UTC-6)": "Hora Central (UTC-6)",
  "Eastern Time (UTC-5)": "Hora del Este (UTC-5)",
  "Atlantic Time (UTC-4)": "Hora del Atlántico (UTC-4)",
  "Argentina Standard Time (UTC-3)": "Hora estándar de Argentina (UTC-3)",
  "South Georgia Time (UTC-2)": "Hora de Georgia del Sur (UTC-2)",
  "Azores Time (UTC-1)": "Hora de las Azores (UTC-1)",
  "Greenwich Mean Time (UTC+0)": "Horario del Meridiano de Greenwich (UTC+0)",
  "Central European Time (UTC+1)": "Hora Central Europea (UTC+1)",
  "Eastern European Time (UTC+2)": "Hora de Europa Oriental (UTC+2)",
  "Moscow Time (UTC+3)": "Hora de Moscú (UTC+3)",
  "Gulf Standard Time (UTC+4)": "Hora estándar del Golfo (UTC+4)",
  "Pakistan Standard Time (UTC+5)": "Hora estándar de Pakistán (UTC+5)",
  "Indian Standard Time (UTC+5:30)": "Hora estándar de la India (UTC+5:30)",
  "Bangladesh Standard Time (UTC+6)": "Hora estándar de Bangladés (UTC+6)",
  "Indochina Time (UTC+7)": "Hora de Indochina (UTC+7)",
  "China Standard Time (UTC+8)": "Hora estándar de China (UTC+8)",
  "Japan Standard Time (UTC+9)": "Hora estándar de Japón (UTC+9)",
  "Australian Eastern Standard Time (UTC+10)": "Hora estándar del Este de Australia (UTC+10)",
  "Solomon Islands Time (UTC+11)": "Hora de las Islas Salomón (UTC+11)",
  "New Zealand Standard Time (UTC+12)": "Hora estándar de Nueva Zelanda (UTC+12)",
  "Account Settings": "Configuración de la cuenta",
  "Manage your account information": "Gestiona la información de tu cuenta",
  "Current Avatar": "Avatar actual",
  "Your avatar shows the initials of your name with an automatic color":
    "Tu avatar muestra las iniciales de tu nombre con un color automático",
  "Choose a new avatar": "Elige un nuevo avatar",
  "Or upload a custom avatar": "O sube un avatar personalizado",
  "Full Name": "Nombre completo",
  "Phone Number": "Número de teléfono",
  "Save Account Settings": "Guardar configuración de cuenta",
  "Security Settings": "Configuración de seguridad",
  "Manage your account's security settings": "Gestiona la configuración de seguridad de tu cuenta",
  "Current Password": "Contraseña actual",
  "New Password": "Nueva contraseña",
  "Confirm New Password": "Confirmar nueva contraseña",
  "Enable Two-Factor Authentication": "Activar la autenticación de dos factores",
  "Save Security Settings": "Guardar configuración de seguridad",
  "Complete all password fields": "Completa todos los campos de contraseña",
  "Unable to update password": "No se ha podido actualizar la contraseña",
  "Password updated successfully": "Contraseña actualizada correctamente",
  "Notification preferences saved": "Preferencias de notificación guardadas",
  "Unable to save notification preferences": "No se han podido guardar las preferencias de notificación",
  "Customize your dashboard experience": "Personaliza tu experiencia en el panel",
  Language: "Idioma",
  Currency: "Moneda",
  "Date Format": "Formato de fecha",
  "Font Size": "Tamaño de fuente",
  Theme: "Tema",
  Light: "Claro",
  Dark: "Oscuro",
  System: "Sistema",
  "Dashboard Layout": "Diseño del panel",
  Default: "Predeterminado",
  Compact: "Compacto",
  Expanded: "Ampliado",
  "Save Preferences": "Guardar preferencias",
  "Notification Settings": "Configuración de notificaciones",
  "Manage how you receive notifications": "Gestiona cómo recibes las notificaciones",
  "Notification Channels": "Canales de notificación",
  "Email Notifications": "Notificaciones por correo electrónico",
  "Push Notifications": "Notificaciones push",
  "SMS Notifications": "Notificaciones SMS",
  "Notification Types": "Tipos de notificación",
  "New Features and Updates": "Novedades y actualizaciones",
  "Marketing and Promotions": "Marketing y promociones",
  "Notification Frequency": "Frecuencia de notificaciones",
  "Real-time": "Tiempo real",
  "Daily Digest": "Resumen diario",
  "Weekly Summary": "Resumen semanal",
  "Quiet Hours": "Horas de silencio",
  to: "a",
  "Save Notification Settings": "Guardar configuración de notificaciones",
  "Privacy Settings": "Configuración de privacidad",
  "Manage your privacy and data settings": "Gestiona tu privacidad y configuración de datos",
  "Cookie Preferences": "Preferencias de cookies",
  "Cookie type analytics": "Cookies analíticas",
  "Cookie type marketing": "Cookies de marketing",
  "Essential cookies are always active": "Las cookies esenciales están siempre activas",
  "They are required for the service to work.": "Son necesarias para el funcionamiento del servicio.",
  "You can see more details in our": "Puedes ver más detalles en nuestra",
  "Cookie Policy": "Política de cookies",
  "Save Privacy Settings": "Guardar configuración de privacidad",
  "Account settings saved successfully": "Configuración de la cuenta guardada correctamente",
  "Notification settings saved successfully": "Configuración de notificaciones guardada correctamente",
  "Privacy settings saved successfully": "Configuración de privacidad guardada correctamente",

  // Calculadora de interés compuesto
  Calculator: "Calculadora",
  "Financial Calculators": "Calculadoras financieras",
  "Calculators intro": "Explora el impacto real de tus decisiones financieras con herramientas rápidas y claras.",
  "Try calculator": "Abrir calculadora",
  "Compound Interest desc": "Cómo crece tu dinero cuando aportas con regularidad y reinviertes los intereses.",
  "Real Estate desc": "Rentabilidad completa de una vivienda: impuestos, hipoteca, alquiler, gastos y revalorización.",
  "Stocks desc": "Analiza una empresa: valoración, métricas clave y gráficos históricos interactivos.",
  "Taxes and fees": "Impuestos y gastos",
  Mortgage: "Hipoteca",
  Scenarios: "Escenarios",
  Projection: "Proyección",
  Valuation: "Valoración",
  Charts: "Gráficos",
  "Live data": "Datos en vivo",
  "Learn before you calculate": "Aprende antes de calcular",
  "Learn hint": "Entiende qué mide cada calculadora y cuándo te resulta útil.",
  "What it measures": "Qué mide",
  "Compound what": "Cuánto crecerá tu dinero con aportaciones periódicas y reinversión de los intereses.",
  "Compound lesson": "El interés se suma al capital y genera nuevos intereses: por eso cada año tu dinero crece más rápido.",
  "Real estate what": "La rentabilidad real de una vivienda en alquiler: impuestos, hipoteca, gastos y revalorización.",
  "Real estate lesson": "El alquiler y la revalorización no lo son todo: los impuestos, el mantenimiento y la hipoteca pueden comerse tu beneficio.",
  "Stocks what": "Si una empresa del mercado está cara o barata según su valoración, sus ratios y su salud financiera.",
  "Stocks lesson": "Un PER bajo o un dividendo alto solo tienen sentido comparados con empresas de su mismo sector.",
  "Compound Interest Calculator": "Calculadora de Interés Compuesto",
  "Initial Investment": "Inversión Inicial",
  Contribution: "Aportación",
  Frequency: "Frecuencia",
  "Annual Interest Rate": "Tasa de Interés (% anual)",
  "Horizon (years)": "Horizonte (años)",
  Years: "Años",
  Monthly: "Mensual",
  Bimonthly: "Bimestral",
  Quarterly: "Trimestral",
  Semiannual: "Semestral",
  Annual: "Anual",
  Calculate: "Calcular",
  "Total Invested": "Total Invertido",
  "Future Interest": "Intereses Futuros",
  "Final Value": "Valor Final",
  "Total Value": "Valor Total",
  Contributions: "Aportaciones",
  "Compound Interest": "Interés Compuesto",
  "Real Estate Assets": "Activos Inmobiliarios",
  "Coming soon": "Próximamente",

  // Calculadora de Activos Inmobiliarios
  "Real Estate Calculator": "Calculadora de Activos Inmobiliarios",
  "Property Price": "Precio de la Propiedad",
  "Purchase Tax": "Impuesto de compra",
  "Transfer Tax (ITP)": "Impuesto Sobre Transmisiones Patrimoniales (ITP)",
  "Documented Acts (AJD)": "Actos Jurídicos Documentados (AJD)",
  "Purchase Tax Costs": "Costes de Impuestos de Compra",
  "Estimated Renovation": "Reforma Estimada",
  "Expected Rent": "Alquiler Esperado",
  Vacancy: "Vacancia",
  "% of time the property will be rented": "% del tiempo en el que la propiedad estará alquilada.",
  "Annual Property Taxes": "Impuestos Anuales de la Propiedad",
  "Property Tax (IBI)": "Impuesto sobre Bienes Inmuebles (IBI)",
  "% of Cadastral Value": "Porcentaje del Valor Catastral",
  "Leveraged Property": "Inmueble Apalancado",
  "Initial Contribution": "Aporte Inicial",
  "Banks usually require 10% of the property + expenses":
    "Los bancos suelen requerir un 10% del inmueble + gastos.",
  "Mortgage Term": "Plazos de la Hipoteca",
  "Mortgage Interest Rate": "Tasa de Interés Hipotecario",
  "Monthly Costs": "Costes Mensuales",
  "HOA fees, maintenance, etc.": "Comunidad de vecinos, mantenimiento, etc.",
  "Total Investment": "Inversión Total",
  "Initial Entry": "Entrada Inicial",
  "Loan Amount": "Importe del Préstamo",
  "Monthly Cash Flow": "Flujo de Caja Mensual",
  "Annual Cash Flow": "Flujo de Caja Anual",
  "Gross Yield": "Rentabilidad Bruta",
  "Net Yield": "Rentabilidad Neta",
  "Annual Return": "Retorno Anual",
  "ROI on Equity": "ROI sobre Capital",
  "Cash on Cash Return": "Retorno sobre Efectivo",
  "Cap Rate": "Tasa Cap",
  "Effective Rent": "Alquiler Efectivo",
  "Monthly Mortgage": "Cuota Hipotecaria",
  "Annual Property Cost": "Coste Anual de la Propiedad",
  "Price to Rent Ratio": "Ratio Precio-Alquiler",
  "years": "años",
  "months": "meses",
  "Summary": "Resumen",
  "Capital": "Capital",
  "Cash Flow": "Flujo de Caja",
  "Additional Metrics": "Métricas Adicionales",
  "Breakeven": "Punto de Equilibrio",
  "months to recoup investment": "meses para recuperar la inversión",
  "1 month to recoup investment": "1 mes para recuperar la inversión",
  "Total Investment (bold)": "Inversión Total",
  "Leveraged": "Apalancado",
  "Without leverage": "Sin apalancar",
  "Total Cost": "Coste Total",
  "Annual Expenses": "Gastos Anuales",
  "Monthly Expenses": "Gastos Mensuales",
  "Property Taxes": "Impuestos de la Propiedad",
  "Coming Soon": "Próximamente",
  "Stocks": "Acciones",
  "Search ticker (e.g. MSFT, AAPL, NVDA)": "Busca por ticker o nombre de empresa (ej: MSFT, Oracle)",
  "Analyze": "Analizar",
  "Target Price": "Precio Objetivo",
  "Expected Value": "Valor Esperado",
  "Potential": "Potencial",
  "Fundamental Score": "Score Fundamental",
  "Fundamentals": "Fundamentales",
  "Valuation": "Valoración",
  "Growth": "Crecimiento",
  "Profitability": "Rentabilidad",
  "Financial Health": "Salud Financiera",
  "Cash Flow": "Cash Flow",
  "Scenarios": "Escenarios",
  "Alerts": "Alertas",
  "Balance & Cash Flow": "Balance y Cash Flow",
  "Sales Growth": "Crecimiento de Ventas",
  "Analyst Consensus": "Consenso de Analistas",
  "Target Mean": "Objetivo Medio",
  "Target High": "Objetivo Máximo",
  "Target Low": "Objetivo Mínimo",
  "ValuationTooltip": "(P/E sector ÷ P/E empresa) × 40% + (EV/EBITDA sector ÷ EV/EBITDA empresa) × 30% + (FCF Yield empresa ÷ FCF Yield sector) × 30%",
  "GrowthTooltip": "(Revenue Growth × 35%) + (EPS Growth × 35%) + (FCF Growth × 30%)",
  "ProfitabilityTooltip": "(ROIC × 50%) + (ROE × 25%) + (Operating Margin × 25%)",
  "FinancialHealthTooltip": "(Net Debt/EBITDA + Interest Coverage + Current Ratio + Debt/Equity) comparados y normalizados frente al sector.",
  "CashFlowTooltip": "(FCF Margin × 33%) + (FCF Growth × 33%) + (FCF Yield × 34%)",
  "Valuation Range": "Rango de Valoración",
  "ValuationBarTooltip":
    "Muestra visualmente dónde se sitúa el precio actual (línea negra) respecto al precio objetivo (línea azul) y el escenario alcista (Bull). Si el precio actual está a la izquierda del objetivo, la acción tiene potencial alcista.",
  "Price History": "Historial de Precio",
  "PriceChartTooltip":
    "Gráfico con los últimos 6 meses de precios. Línea sólida: precio real. Línea punteada azul: precio objetivo. Verde: escenario alcista (Bull). Rojo: escenario bajista (Bear).",
  "No historical data": "No hay datos históricos disponibles",
  "Line": "Línea",
  "Candle": "Velas",
  "ScenariosTooltip":
    "Porcentaje de probabilidad asignado a cada escenario para calcular el valor esperado ponderado.",
  "Analysts": "Analistas",
  "Consensus": "Consenso",
  "Our Model": "Nuestro Modelo",
  "Analysts": "Analistas",
  "What do the numbers tell us?": "¿Qué nos dicen los números?",
  "Current Price": "Precio Actual",
  "This analysis is based on publicly available data and should not be considered financial advice.":
    "Este análisis se basa en datos públicos y no debe considerarse asesoramiento financiero.",

  // Familia y miembros
  "Create Family Unit": "Crear Unidad Familiar",
  "Family name": "Nombre de familia",
  "Create a family unit to share account summaries with your family members.":
    "Crea una unidad familiar para compartir resúmenes de cuentas con tus familiares.",
  "Family created": "Familia creada",
  "Error creating family": "Error al crear familia",
  "Add Family Member": "Añadir Miembro de Familia",
  "Email address": "Correo electrónico",
  "Search": "Buscar",
  "Searching...": "Buscando...",
  "User not found with that email": "Usuario no encontrado con ese email",
  "Cannot add yourself": "No puedes añadirte a ti mismo",
  "Error searching for user": "Error al buscar usuario",
  "Member added": "Miembro añadido",
  "Member removed": "Miembro eliminado",
  "User found in the system": "Usuario encontrado en el sistema",
  "User found — click Add to include them": "Usuario encontrado — pulsa Añadir para incluirlo",
  "Invitation sent": "Invitación enviada",
  "Invitation sent — they will receive an email to sign up": "Invitación enviada — recibirá un email para registrarse",
  "Error sending invitation": "Error al enviar la invitación",
  "Could not find user or send invitation": "No se pudo encontrar al usuario ni enviar la invitación",
  "User found": "Usuario encontrado",
  "User not registered yet": "Este usuario aún no tiene cuenta. Comparte el enlace de invitación para que se registre.",
  "Share this invitation link": "Comparte este enlace de invitación",
  "Link copied": "Enlace copiado",
  "Error copying link": "Error al copiar enlace",
  "Add as Pending": "Añadir como Pendiente",
  "Member added as pending": "Miembro añadido como pendiente",
  "Pending": "Pendiente",
  "Awaiting registration": "Esperando registro",
  "Open invitation link": "Abrir enlace de invitación",
  "Remove member": "Eliminar miembro",
  "No family members yet. Add members to see their account summaries.":
    "Aún no hay miembros. Añade familiares para ver sus resúmenes de cuentas.",
  "No data available": "Sin datos disponibles",
  "Admin": "Admin",
  "Member": "Miembro",
  "Viewer": "Visor",
  "Checking Balance": "Saldo Corriente",

  // Permisos
  "You need to create a family unit first to manage permissions.":
    "Primero necesitas crear una unidad familiar para gestionar permisos.",
  "Go to Members": "Ir a Miembros",
  "Only the family admin can manage permissions.":
    "Solo el admin de la familia puede gestionar permisos.",
  "No other family members to set permissions for.":
    "No hay otros miembros para configurar permisos.",
  "View Account Summary": "Ver Resumen de Cuentas",
  "Can see income, expenses and balance":
    "Puede ver ingresos, gastos y saldo",
  "Manage Members": "Gestionar Miembros",
  "Can add and remove family members":
    "Puede añadir y eliminar miembros de la familia",
  "Permissions saved": "Permisos guardados",
  "Save": "Guardar",

  // Página de bienvenida (landing)
  "Go to app": "Ir a la app",
  Features: "Características",
  Blog: "Blog",
  "The trusted financial platform": "La plataforma financiera de confianza",
  "Take control of your finances.": "Controla tus finanzas.",
  "Decide with": "Decide con",
  intelligence: "inteligencia",
  "Hero intro":
    "MakeItRight reúne tu patrimonio, tus inversiones y tus cálculos en un solo lugar. Analiza, simula y planifica tu futuro financiero con herramientas de nivel profesional.",
  "Start for free": "Empieza gratis",
  "View calculators": "Ver calculadoras",
  "14-day free trial · No credit card required":
    "14 días de prueba gratuita · Sin tarjeta de crédito",
  "All your money, under control": "Todo tu dinero, bajo control",
  "Tools that were once reserved for professional financial advisors.":
    "Herramientas que antes solo estaban al alcance de asesores profesionales.",
  "Track your net worth": "Control de patrimonio",
  "Track your net worth desc":
    "Sincroniza tus cuentas y sigue tu patrimonio neto al día. Ingresos, gastos y ahorro en un solo panel.",
  "Financial calculators desc":
    "Interés compuesto, inmuebles y acciones. Simula escenarios antes de tomar decisiones.",
  "Advanced analytics": "Análisis avanzado",
  "Advanced analytics desc":
    "Gráficos, métricas y diagnóstico automático de tu salud financiera con recomendaciones personalizadas.",
  "Smart investing": "Inversión inteligente",
  "Smart investing desc":
    "Sigue tu cartera con cotizaciones en tiempo real y analiza cada activo con nuestro modelo propio.",
  "Bank-grade security": "Seguridad bancaria",
  "Bank-grade security desc":
    "Autenticación segura y cifrado de extremo a extremo. Tus datos protegidos con los estándares más exigentes.",
  "Long-term planning": "Planificación a largo plazo",
  "Long-term planning desc":
    "Proyecciones de rentabilidad, análisis de deuda y simulación de hipotecas para planificar tu futuro.",
  "Try without signing up": "Prueba sin registro",
  "Our calculators, at your fingertips": "Nuestras calculadoras, a tu alcance",
  "Calculators highlight intro":
    "No necesitas crear una cuenta para empezar. Accede gratis a todas nuestras calculadoras y hazte una idea de lo que es posible.",
  "Compound interest with periodic contributions":
    "Interés compuesto con aportaciones periódicas",
  "Real rental yield of investment properties": "Rentabilidad real de propiedades en alquiler",
  "Fundamental stock analysis with a price target":
    "Análisis fundamental de acciones con objetivo de precio",
  "Rental property": "Inmueble en alquiler",
  "Stock portfolio": "Cartera de acciones",
  "in 15 years at 8% annual": "en 15 años al 8% anual",
  "net annual yield": "rentabilidad neta anual",
  "consensus upside potential": "potencial alcista del consenso",
  "Frequently asked questions": "Preguntas frecuentes",
  "We answer the most common questions before you get started.":
    "Resolvemos las dudas más comunes antes de que empieces.",
  "What is MakeItRight?": "¿Qué es MakeItRight?",
  "What is MakeItRight? answer":
    "Es una plataforma de finanzas personales que reúne tu patrimonio, tus ingresos y gastos, tus inversiones y calculadoras financieras en un solo lugar. Analiza, simula y planifica tu futuro financiero con herramientas de nivel profesional.",
  "Who is MakeItRight designed for?": "¿Para quién está pensado el uso de MakeItRight?",
  "Who is MakeItRight designed for? answer":
    "Para cualquier persona que quiera controlar sus finanzas: desde quienes empiezan a ahorrar hasta perfiles que invierten en inmuebles y acciones. No necesitas ser experto para usarla.",
  "Is my financial data safe?": "¿Mis datos financieros están seguros?",
  "Is my financial data safe? answer":
    "Sí. Usamos autenticación segura y cifrado de extremo a extremo. Tus datos no se comparten con terceros y puedes exportarlos o eliminarlos cuando quieras.",
  "Can I use the calculators without signing up?":
    "¿Puedo usar las calculadoras sin registrarme?",
  "Can I use the calculators without signing up? answer":
    "Sí. Todas nuestras calculadoras son de acceso libre y no requieren crear una cuenta. Puedes probarlas para hacerte una idea de lo que ofrece la plataforma.",
  "Can I cancel or change plans anytime?": "¿Puedo cancelar o cambiar de plan cuando quiera?",
  "Can I cancel or change plans anytime? answer":
    "Sí, sin permanencia ni costes ocultos. Puedes cambiar o cancelar tu plan en cualquier momento desde tu cuenta.",
  "Is my data synced across devices?": "¿Mis datos se sincronizan entre dispositivos?",
  "Is my data synced across devices? answer":
    "Sí. Al iniciar sesión, tu patrimonio, movimientos y configuración se sincronizan en todos tus dispositivos.",
  "Do I need a credit card to try the app?":
    "¿Necesito una tarjeta de crédito para probar la app?",
  "Do I need a credit card to try the app? answer":
    "No. El plan Estándar es gratuito y no pide tarjeta. Solo la necesitarás si decides pasar a Premium o Pro.",
  Plans: "Planes",
  "Start for free and scale when you need it.":
    "Empieza gratis y escala cuando lo necesites.",
  Standard: "Estándar",
  "/month": "/mes",
  "Unlimited calculators": "Calculadoras ilimitadas",
  "Basic net worth dashboard": "Panel básico de patrimonio",
  "1 synced account": "1 cuenta sincronizada",
  "Email support": "Soporte por email",
  "Start free": "Comenzar gratis",
  "All Standard features": "Todas las funciones Estándar",
  "AI chat": "Chat con IA",
  "Advanced analytics and diagnosis": "Análisis y diagnóstico avanzado",
  "Real-time portfolio": "Cartera en tiempo real",
  "Reports and exports": "Informes y exportación",
  "Priority support": "Soporte prioritario",
  "Start now": "Empezar ahora",
  Pro: "Pro",
  "Most popular": "Más popular",
  "A single annual payment of 29.99€": "Un solo pago anual de 29,99€",
  "Save €18 per year": "Ahorra 18€ al año",
  "Start making better financial decisions today":
    "Empieza a tomar mejores decisiones financieras hoy",
  "Join thousands of users who already take control of their financial future with MakeItRight.":
    "Únete a miles de usuarios que ya controlan su futuro financiero con MakeItRight.",
  "Create free account": "Crear cuenta gratuita",

  // Páginas legales y pie de página
  here: "aquí",
  "Last updated": "Última actualización",
  "All rights reserved.": "Todos los derechos reservados.",
  "Legal Notice": "Aviso Legal",
  "Privacy Policy": "Política de Privacidad",
  "Terms of Service": "Términos de Servicio",

  // Aviso Legal
  "Legal intro prefix": "Este documento, junto con la",
  "Legal intro between": ", los",
  "Legal intro between2": " y la",
  "Legal intro suffix":
    ", regula el uso del sitio web MakeItRight (a partir de ahora, el \"Sitio Web\") y de todos los servicios que ofrecemos a través de él.",
  "1. Service provider identification": "1. Identificación del prestador",
  "Legal provider text":
    "El Sitio Web y el servicio MakeItRight están operados por MakeItRight, que actúa como prestador de servicios de la sociedad de la información.",
  "Legal registry prefix":
    "Los datos registrales de la sociedad y su domicilio social pueden solicitarse en cualquier momento; ponte en contacto a través del enlace de",
  "Legal registry suffix": "y te los facilitaremos.",
  "2. Purpose of the Website": "2. Objeto del Sitio Web",
  "Legal purpose text":
    "MakeItRight es una plataforma orientada a la gestión de las finanzas personales: permite llevar el control del patrimonio, registrar y analizar ingresos y gastos, evaluar inversiones y utilizar calculadoras financieras, además de obtener asistencia con inteligencia artificial. Parte de estas funciones requieren una suscripción de pago.",
  "3. Access and use conditions": "3. Condiciones de acceso y uso",
  "Legal access prefix":
    "La mayor parte del contenido es de acceso libre, pero algunas funciones solo están disponibles tras registrarse y contar con una suscripción activa, tal y como se detalla en los",
  "Legal access suffix":
    "Al utilizar el Sitio Web te comprometes a hacerlo de forma honesta y dentro del marco legal, respetando las condiciones que establece este Aviso.",
  "4. Intellectual property": "4. Propiedad intelectual",
  "Legal IP text":
    "El software, el diseño, los textos, los gráficos, los logotipos y las marcas que aparecen en el Sitio Web son de nuestra titularidad o de nuestros licenciantes y están protegidos por la normativa de propiedad intelectual. Queda prohibida su reproducción, distribución o explotación comercial sin nuestra autorización previa y por escrito, salvo en los casos que permita expresamente la normativa aplicable.",
  "5. Liability": "5. Responsabilidad",
  "Legal liability text":
    "Parte de la información financiera y de mercado que mostramos procede de fuentes públicas o de terceros y puede contener errores, estar incompleta o haber quedado desactualizada. Los contenidos, incluidos los informes elaborados con IA, tienen una finalidad exclusivamente divulgativa y en ningún caso suponen asesoramiento financiero, legal, fiscal o de inversión. Por tanto, no podemos garantizar la exactitud ni la vigencia de los datos que se presentan.",
  "6. Links to third-party sites": "6. Enlaces a sitios de terceros",
  "Legal links text":
    "Es posible que el Sitio Web incluya enlaces a páginas externas. No tenemos ningún control sobre su contenido ni sobre sus políticas, por lo que declinamos cualquier responsabilidad en relación con esos sitios.",
  "7. Governing law and jurisdiction": "7. Legislación aplicable y jurisdicción",
  "Legal law text":
    "Las relaciones derivadas del uso del Sitio Web se rigen por la legislación española, sin perjuicio de las normas imperativas de protección de los consumidores que te resulten de aplicación cuando actúes como consumidor conforme al Derecho de la Unión Europea.",
  "8. Contact": "8. Contacto",
  "Legal contact prefix":
    "Si tienes alguna duda sobre este Aviso Legal, puedes escribirnos desde el enlace de",

  // Política de Privacidad
  "Privacy intro":
    "Esta política explica cómo MakeItRight recopila, utiliza y protege tus datos personales cuando usas nuestro sitio web y los servicios asociados.",
  "1. Data controller": "1. Responsable del tratamiento",
  "Privacy controller text":
    "El responsable del tratamiento es MakeItRight. Los datos de registro de la sociedad están disponibles bajo solicitud; puedes pedirlos escribiéndonos a través del enlace de",
  "2. Data we collect": "2. Qué datos recopilamos",
  "Account data": "Datos de cuenta",
  "Account data desc":
    "nombre, correo electrónico, teléfono (opcional), contraseña (almacenada cifrada), idioma y preferencias de región.",
  "Usage data": "Datos de uso",
  "Usage data desc":
    "operaciones guardadas, datos introducidos en las calculadoras y el panel, alertas configuradas, páginas visitadas, información del dispositivo y navegador, y dirección IP.",
  "Payment data": "Datos de pago",
  "Payment data desc":
    "los pagos se procesan a través de un proveedor externo. No almacenamos los números completos de tarjeta; recibimos únicamente el estado de la suscripción, el plan y los metadatos de facturación.",
  Communications: "Comunicaciones",
  "Communications desc":
    "mensajes que nos envías por soporte, por el asistente de chat o en los comentarios de herramientas compartidas.",
  "3. Why we process your data and legal basis":
    "3. Por qué tratamos tus datos y base legal",
  "Privacy basis service": "Prestar el servicio y gestionar tu cuenta (ejecución de un contrato).",
  "Privacy basis payments":
    "Procesar pagos y gestionar las suscripciones (ejecución de un contrato).",
  "Privacy basis emails":
    "Enviar correos transaccionales y, si las configuras, alertas (ejecución de un contrato).",
  "Privacy basis chat":
    "Respuestas de chat basadas en tus consultas (ejecución de un contrato).",
  "Privacy basis analytics":
    "Analizar el uso y mejorar el producto (interés legítimo).",
  "Privacy basis marketing":
    "Comunicaciones de marketing y cookies no esenciales, solo con tu consentimiento (consentimiento).",
  "Privacy basis legal": "Cumplir obligaciones legales, como facturación e impuestos (obligación legal).",
  "4. Who we share your data with": "4. Con quién compartimos tus datos",
  "Privacy sharing intro":
    "Compartimos datos con proveedores que nos ayudan a operar, limitado a lo que cada uno necesita para su función:",
  "Shared Supabase": "Supabase — base de datos, autenticación y almacenamiento.",
  "Shared Clerk": "Clerk — autenticación de usuarios.",
  "Shared Stripe": "Stripe — procesamiento de pagos y facturación de suscripciones.",
  "Shared Google": "Google (Gemini) — generación de informes asistidos por IA y chat.",
  "Shared Vercel": "Vercel y Vercel Analytics — alojamiento y analítica del sitio.",
  "Shared Sentry": "Sentry — monitorización de errores.",
  "Privacy sharing outro":
    "Exigimos a estos proveedores que protejan tus datos conforme a sus propios compromisos de privacidad y, cuando corresponde, mediante cláusulas contractuales tipo. No vendemos tus datos personales.",
  "5. International transfers": "5. Transferencias internacionales",
  "Privacy transfers text":
    "Algunos de los proveedores podrían tratar datos fuera del Espacio Económico Europeo, por ejemplo en Estados Unidos. En esos casos nos apoyamos en garantías adecuadas, como las Cláusulas Contractuales Tipo de la UE o la participación del proveedor en un marco de protección de datos aprobado (como el Data Privacy Framework UE-EE. UU.).",
  "6. How long we keep your data": "6. Cuánto tiempo conservamos tus datos",
  "Privacy retention text":
    "Conservamos los datos de tu cuenta mientras siga activa y durante un plazo razonable posterior para cumplir obligaciones legales, fiscales y de resolución de controversias. Puedes solicitar su eliminación anticipada; consulta la sección \"Tus derechos\".",
  "7. Your rights": "7. Tus derechos",
  "Privacy rights text":
    "Conforme a la normativa aplicable, tienes derecho a acceder, rectificar, suprimir, limitar u oponerte al tratamiento de tus datos, a la portabilidad de los mismos y a retirar tu consentimiento en cualquier momento. También puedes presentar una reclamación ante tu autoridad de protección de datos (en España, la AEPD). Para ejercer cualquiera de estos derechos, escríbenos",
  "8. Security": "8. Seguridad",
  "Privacy security text":
    "Aplicamos medidas técnicas y organizativas razonables —entre ellas cifrado en tránsito, controles de acceso y contraseñas cifradas— para proteger tus datos. No obstante, ningún método de transmisión o almacenamiento es seguro al 100%.",
  "9. Minors": "9. Menores",
  "Privacy minors text":
    "El servicio no está dirigido a menores de 18 años y no recopilamos conscientemente datos de menores.",
  "10. Changes to this policy": "10. Cambios en esta política",
  "Privacy changes text":
    "Podemos actualizar esta política periódicamente. Los cambios sustanciales se notificarán a través del sitio web o por correo electrónico.",
  "11. Contact": "11. Contacto",
  "Privacy contact text": "Para cualquier consulta sobre esta política o sobre tus datos, contáctanos",

  // Términos de Servicio
  "Terms intro":
    "Estos Términos de Servicio (\"Términos\") rigen el uso de MakeItRight, operado por MakeItRight. Al crear una cuenta o utilizar el servicio, aceptas estos Términos.",
  "1. Service description": "1. Descripción del servicio",
  "Terms description text":
    "MakeItRight es una plataforma de gestión de finanzas personales por suscripción que facilita el control del patrimonio, el registro y análisis de ingresos y gastos, la evaluación de inversiones y el uso de calculadoras financieras, además de respuestas asistidas por IA.",
  "2. Account registration": "2. Registro de cuenta",
  "Terms registration text":
    "Debes facilitar información veraz al crear tu cuenta, mantener tus credenciales seguras y responder de la actividad que se realice bajo tu cuenta. Debes tener la edad legal para contratar en tu país de residencia.",
  "3. Subscriptions, billing and free trials":
    "3. Suscripciones, facturación y pruebas gratuitas",
  "Terms subscriptions text":
    "Los planes y precios se muestran antes de completar la compra. Las suscripciones se renuevan automáticamente por el mismo periodo salvo que se cancelen antes de la fecha de renovación. Cuando se ofrezcan, las pruebas gratuitas se convierten automáticamente en una suscripción de pago salvo que se cancelen antes del fin del periodo de prueba. Los precios se muestran en la moneda aplicable y pueden incluir o no impuestos según tu ubicación.",
  "4. Cancellation and refunds": "4. Cancelación y reembolsos",
  "Terms cancellation text":
    "Puedes cancelar tu suscripción en cualquier momento desde los ajustes de tu cuenta; la cancelación surte efecto al final del periodo de facturación en curso y mantienes el acceso hasta entonces. Como el acceso se concede por el periodo completo ya pagado, por lo general no ofrecemos reembolsos prorrateados por periodos parciales, salvo cuando la ley lo exija (por ejemplo, el derecho de desistimiento de los consumidores de la UE, con las excepciones aplicables cuando consientas el acceso inmediato a un servicio o a contenido digital).",
  "5. Acceptable use": "5. Uso aceptable",
  "Terms acceptable use text":
    "Te comprometes a no extraer datos (scraping), realizar ingeniería inversa ni revender nuestros datos o la plataforma sin nuestro permiso por escrito, a no usar el servicio con fines ilícitos, abusivos o fraudulentos, y a no intentar eludir los límites de uso o las medidas de seguridad.",
  "6. Data accuracy and no investment advice":
    "6. Exactitud de los datos y ausencia de asesoramiento de inversión",
  "Terms accuracy text":
    "Parte de los datos financieros y de mercado mostrados en el servicio puede proceder de fuentes públicas o de terceros. Estos datos pueden ser incompletos, estar desactualizados o contener errores, y no estamos afiliados ni respaldados por ninguno de esos proveedores. Todo el contenido, incluida la asistencia prestada con IA, se ofrece con fines meramente informativos y no constituye asesoramiento financiero, legal, fiscal ni de inversión. Eres el único responsable de tus decisiones de inversión y debes verificar de forma independiente los datos y buscar asesoramiento profesional antes de actuar en base a ellos.",
  "7. Intellectual property": "7. Propiedad intelectual",
  "Terms IP text":
    "La plataforma, el software, el diseño y las marcas son propiedad nuestra o de nuestros licenciantes. Al suscribirte se te concede una licencia limitada, no exclusiva e intransferible para usar el servicio con fines internos propios.",
  "8. Limitation of liability": "8. Limitación de responsabilidad",
  "Terms liability text":
    "En la máxima medida permitida por la ley, no seremos responsables de daños indirectos, incidentales o consecuentes, ni de pérdidas de inversión derivadas de la confianza depositada en los datos o respuestas del servicio. Nada en estos Términos limita la responsabilidad que no pueda excluirse conforme a la ley aplicable, incluida la responsabilidad por fraude o, para los consumidores de la UE, los derechos imperativos de protección al consumidor.",
  "9. Termination": "9. Terminación",
  "Terms termination text":
    "Podemos suspender o cancelar cuentas que incumplan estos Términos. Puedes dejar de usar el servicio y cancelar tu suscripción en cualquier momento.",
  "10. Changes to these Terms": "10. Cambios en estos Términos",
  "Terms changes text":
    "Podemos actualizar estos Términos periódicamente. El uso continuado del servicio tras la entrada en vigor de los cambios constituye la aceptación de los Términos actualizados. Te notificaremos los cambios sustanciales a través del sitio web o por correo electrónico.",
  "11. Governing law": "11. Legislación aplicable",
  "Terms law text":
    "Estos Términos se rigen por la legislación española, sin perjuicio de las normas imperativas de protección de los consumidores de tu país de residencia que puedan resultar aplicables si tienes la condición de consumidor conforme al Derecho de la UE.",
  "12. Contact": "12. Contacto",
  "Terms contact text": "Para cualquier consulta sobre estos Términos, contáctanos",

  // Política de Cookies
  "Cookies intro":
    "Esta Política de Cookies explica cómo MakeItRight utiliza cookies y tecnologías similares en nuestro sitio web.",
  "1. What cookies are": "1. Qué son las cookies",
  "Cookies what text":
    "Las cookies son pequeños archivos almacenados en tu dispositivo que ayudan a que un sitio web funcione y nos permiten entender cómo se utiliza.",
  "2. Types of cookies we use": "2. Tipos de cookies que utilizamos",
  "Essential cookies":
    "Esenciales o estrictamente necesarias — autenticación y gestión de sesión, seguridad y preferencias guardadas como tu idioma. No se pueden desactivar porque son necesarias para el funcionamiento del servicio.",
  "Analytics cookies":
    "Analíticas o de rendimiento — nos ayudan a entender el uso y a mejorar el producto.",
  "Marketing cookies":
    "Publicitarias o de marketing — se usan para medir y mejorar el rendimiento de nuestros anuncios; solo se cargan cuando está permitido.",
  "3. Third-party cookies we use": "3. Cookies de terceros que utilizamos",
  "Cookie Google": "Google Analytics (Google) — analítica.",
  "Cookie Vercel": "Vercel Analytics / Speed Insights (Vercel) — analítica y rendimiento.",
  "Cookie Stripe": "Stripe — prevención de fraude durante el pago.",
  "Cookie Supabase": "Supabase — autenticación y gestión de sesión.",
  "Cookie Clerk": "Clerk — autenticación y gestión de sesión.",
  "4. Managing cookies": "4. Gestión de cookies",
  "Cookies manage text":
    "Puedes ajustar la configuración de tu navegador para bloquear o eliminar cookies en cualquier momento. Ten en cuenta que bloquear las cookies esenciales puede afectar funcionalidades clave, como mantener tu sesión iniciada.",
  "5. Changes to this policy": "5. Cambios en esta política",
  "Cookies changes text":
    "Podemos actualizar esta Política de Cookies periódicamente y te lo notificaremos a través del sitio web o por correo electrónico.",
  "6. Contact": "6. Contacto",
  "Cookies contact text": "Para cualquier consulta sobre esta Política de Cookies, contáctanos",

  // Centro de ayuda
  "Help Center": "Centro de ayuda",
  "Tell us your question or issue and we will get back to you as soon as possible.":
    "Cuéntanos tu consulta o problema y te responderemos lo antes posible.",
  "Send us a message": "Envíanos un mensaje",
  "Fill in the form and your message will reach us directly.":
    "Rellena el formulario y tu mensaje nos llegará directamente.",
  Name: "Nombre",
  "Your name": "Tu nombre",
  "Your email": "Tu correo",
  "you@email.com": "tu@correo.com",
  Subject: "Asunto",
  "What is this about?": "¿Sobre qué nos escribes?",
  Message: "Mensaje",
  "Write your question here...": "Escribe aquí tu consulta…",
  "Sending...": "Enviando…",
  "Send message": "Enviar mensaje",
  "Message sent! We will get back to you as soon as possible.":
    "¡Mensaje enviado! Te responderemos lo antes posible.",
  "The message could not be sent. Please try again in a few minutes.":
    "No se ha podido enviar el mensaje. Inténtalo de nuevo en unos minutos.",

  // Panel principal (Dashboard)
  "This month": "Este mes",
  "Last month": "El mes pasado",
  "Expenses this month": "Gastos del mes",
  "Income this month": "Ingresos del mes",
  "Total debt": "Deuda total",
  debts: "deudas",
  "Quick actions": "Acciones rápidas",
  estimated: "estimado",
  "Open analytics": "Abrir análisis",
  "Need to understand your numbers?": "¿Necesitas entender tus números?",
  "GenAI Financial Advisor": "Asesor Financiero GenAI",
  "AI Insight": "Análisis de la IA",
  Regenerate: "Regenerar",
  "Try again": "Volver a intentarlo",
  "Ask Aurora about this": "Pregunta a Aurora sobre esto",
}

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const STORAGE_KEY = "appLanguage"

// Permite traducir a ingles textos que entran en castellano
// (p. ej. nombres guardados como "Sin concepto")
const spanishToEnglish = Object.fromEntries(
  Object.entries(translations).map(([english, spanish]) => [spanish, english]),
)

// Textos en inglés para las páginas de bienvenida y legales.
// Las claves usadas con t() deben mostrarse en inglés cuando lang === "en".
const englishOverrides: Record<string, string> = {
  // Ajustes
  "Cookie type analytics": "Analytics cookies",
  "Cookie type marketing": "Marketing cookies",

  // Registro
  "Sign up": "Sign up",
  "Create your account": "Create your account",
  "Email address": "Email address",
  "Enter your email": "Enter your email",
  "Enter your password": "Enter your password",
  "Enter your date of birth": "Enter your date of birth",
  "You must be at least 18 years old": "You must be at least 18 years old",
  "Verification code": "Verification code",
  "Enter the code we sent to": "Enter the code we sent to",
  "Verify account": "Verify account",
  "Verify": "Verify",
  "I need a new code": "I need a new code",
  "Resend code": "Resend code",
  "End-to-end encrypted": "End-to-end encrypted",

  // Bienvenida
  "Hero intro":
    "MakeItRight brings your wealth, your investments and your calculations together in one place. Analyze, simulate and plan your financial future with professional-grade tools.",
  "Track your net worth desc":
    "Sync your accounts and keep your net worth up to date every day. Income, expenses and savings in a single dashboard.",
  "Financial calculators desc":
    "Compound interest, real estate and stocks. Simulate scenarios before making decisions.",
  "Advanced analytics desc":
    "Charts, metrics and an automatic diagnosis of your financial health with personalized recommendations.",
  "Smart investing desc":
    "Track your portfolio with real-time quotes and analyze each asset with our own model.",
  "Bank-grade security desc":
    "Secure authentication and end-to-end encryption. Your data protected with the highest standards.",
  "Long-term planning desc":
    "Return projections, debt analysis and mortgage simulations to plan your future.",
  "Calculators highlight intro":
    "You don't need an account to get started. Access all our calculators for free and get a feel for what's possible.",
  "What is MakeItRight? answer":
    "It is a personal finance platform that brings your wealth, income and expenses, investments and financial calculators together in one place. Analyze, simulate and plan your financial future with professional-grade tools.",
  "Who is MakeItRight designed for? answer":
    "For anyone who wants to take control of their finances: from people just starting to save to profiles that invest in real estate and stocks. You don't need to be an expert to use it.",
  "Is my financial data safe? answer":
    "Yes. We use secure authentication and end-to-end encryption. Your data is not shared with third parties and you can export or delete it whenever you want.",
  "Can I use the calculators without signing up? answer":
    "Yes. All our calculators are free to access and don't require an account. You can try them to get an idea of what the platform offers.",
  "Can I cancel or change plans anytime? answer":
    "Yes, with no commitment or hidden costs. You can change or cancel your plan at any time from your account.",
  "Is my data synced across devices? answer":
    "Yes. When you sign in, your net worth, transactions and settings sync across all your devices.",
  "Do I need a credit card to try the app? answer":
    "No. The Standard plan is free and doesn't ask for a card. You'll only need it if you decide to upgrade to Premium or Pro.",

  // Aviso Legal
  "Legal intro prefix": "This document, together with the",
  "Legal intro between": ", the",
  "Legal intro between2": " and the",
  "Legal intro suffix":
    ", governs the use of the MakeItRight website (the \"Website\") and all the services we offer through it.",
  "Legal provider text":
    "The Website and the MakeItRight service are operated by MakeItRight, acting as an information society service provider.",
  "Legal registry prefix":
    "The company registration details and registered office can be requested at any time; get in touch through the link",
  "Legal registry suffix": "and we will provide them.",
  "Legal purpose text":
    "MakeItRight is a platform focused on managing personal finances: it lets you track your net worth, record and analyze income and expenses, evaluate investments and use financial calculators, in addition to getting AI-powered assistance. Some of these features require a paid subscription.",
  "Legal access prefix":
    "Most of the content is freely accessible, but some features are only available after registering and having an active subscription, as detailed in the",
  "Legal access suffix":
    "By using the Website you agree to do so honestly and within the legal framework, respecting the conditions set out in this Notice.",
  "Legal IP text":
    "The software, design, texts, graphics, logos and trademarks that appear on the Website belong to us or our licensors and are protected by intellectual property regulations. Their reproduction, distribution or commercial exploitation without our prior written authorization is prohibited, except in the cases expressly permitted by applicable law.",
  "Legal liability text":
    "Part of the financial and market information we show comes from public or third-party sources and may contain errors, be incomplete or be outdated. The content, including AI-generated reports, is for informational purposes only and in no case constitutes financial, legal, tax or investment advice. Therefore, we cannot guarantee the accuracy or timeliness of the data presented.",
  "Legal links text":
    "The Website may include links to external pages. We have no control over their content or policies, so we decline any responsibility in connection with those sites.",
  "Legal law text":
    "The relationships arising from the use of the Website are governed by Spanish law, without prejudice to the mandatory consumer protection rules that apply to you when you act as a consumer under European Union law.",
  "Legal contact prefix": "If you have any questions about this Legal Notice, you can write to us from the link",

  // Política de Privacidad
  "Privacy intro":
    "This policy explains how MakeItRight collects, uses and protects your personal data when you use our website and the related services.",
  "Privacy controller text":
    "The data controller is MakeItRight. The company registration details are available upon request; you can ask for them by writing to us through the link",
  "Account data desc":
    "name, email address, phone number (optional), password (stored encrypted), language and regional preferences.",
  "Usage data desc":
    "saved transactions, data entered in the calculators and the dashboard, configured alerts, pages visited, device and browser information, and IP address.",
  "Payment data desc":
    "payments are processed through an external provider. We do not store full card numbers; we only receive the subscription status, the plan and billing metadata.",
  "Communications desc":
    "messages you send us through support, the chat assistant or comments on shared tools.",
  "Privacy basis service": "Provide the service and manage your account (performance of a contract).",
  "Privacy basis payments":
    "Process payments and manage subscriptions (performance of a contract).",
  "Privacy basis emails":
    "Send transactional emails and, if you set them up, alerts (performance of a contract).",
  "Privacy basis chat": "Chat responses based on your queries (performance of a contract).",
  "Privacy basis analytics": "Analyze usage and improve the product (legitimate interest).",
  "Privacy basis marketing":
    "Marketing communications and non-essential cookies, only with your consent (consent).",
  "Privacy basis legal":
    "Comply with legal obligations, such as invoicing and taxes (legal obligation).",
  "Privacy sharing intro":
    "We share data with providers that help us operate, limited to what each one needs for its function:",
  "Shared Supabase": "Supabase — database, authentication and storage.",
  "Shared Clerk": "Clerk — user authentication.",
  "Shared Stripe": "Stripe — payment processing and subscription billing.",
  "Shared Google": "Google (Gemini) — AI-assisted reports and chat.",
  "Shared Vercel": "Vercel and Vercel Analytics — hosting and site analytics.",
  "Shared Sentry": "Sentry — error monitoring.",
  "Privacy sharing outro":
    "We require these providers to protect your data in line with their own privacy commitments and, where applicable, through standard contractual clauses. We do not sell your personal data.",
  "Privacy transfers text":
    "Some of these providers may process data outside the European Economic Area, for example in the United States. In those cases we rely on adequate safeguards, such as the EU Standard Contractual Clauses or the provider's participation in an approved data protection framework (such as the EU-US Data Privacy Framework).",
  "Privacy retention text":
    "We keep your account data while the account remains active and for a reasonable period afterwards to comply with legal, tax and dispute resolution obligations. You can request its early deletion; see the \"Your rights\" section.",
  "Privacy rights text":
    "Under applicable law, you have the right to access, rectify, erase, restrict or object to the processing of your data, to data portability and to withdraw your consent at any time. You may also lodge a complaint with your data protection authority (in Spain, the AEPD). To exercise any of these rights, write to us",
  "Privacy security text":
    "We apply reasonable technical and organizational measures — including encryption in transit, access controls and encrypted passwords — to protect your data. However, no method of transmission or storage is 100% secure.",
  "Privacy minors text":
    "The service is not directed to people under 18, and we do not knowingly collect data from minors.",
  "Privacy changes text":
    "We may update this policy periodically. Substantial changes will be notified through the website or by email.",
  "Privacy contact text": "For any questions about this policy or about your data, contact us",

  // Términos de Servicio
  "Terms intro":
    "These Terms of Service (\"Terms\") govern the use of MakeItRight, operated by MakeItRight. By creating an account or using the service, you accept these Terms.",
  "Terms description text":
    "MakeItRight is a subscription-based personal finance management platform that makes it easy to track your net worth, record and analyze income and expenses, evaluate investments and use financial calculators, in addition to AI-assisted responses.",
  "Terms registration text":
    "You must provide true information when creating your account, keep your credentials secure and be responsible for the activity carried out under your account. You must be of legal age to contract in your country of residence.",
  "Terms subscriptions text":
    "Plans and prices are shown before completing the purchase. Subscriptions renew automatically for the same period unless canceled before the renewal date. Where offered, free trials automatically become a paid subscription unless canceled before the end of the trial period. Prices are shown in the applicable currency and may or may not include taxes depending on your location.",
  "Terms cancellation text":
    "You can cancel your subscription at any time from your account settings; cancellation takes effect at the end of the current billing period and you keep access until then. Since access is granted for the full period already paid, we generally do not offer prorated refunds for partial periods, except where the law requires it (for example, the withdrawal right of EU consumers, subject to the applicable exceptions when you consent to immediate access to a service or digital content).",
  "Terms acceptable use text":
    "You agree not to scrape data, reverse engineer or resell our data or platform without our written permission, not to use the service for unlawful, abusive or fraudulent purposes, and not to attempt to circumvent usage limits or security measures.",
  "Terms accuracy text":
    "Some of the financial and market data shown in the service may come from public or third-party sources. This data may be incomplete, outdated or contain errors, and we are not affiliated with or endorsed by any of those providers. All content, including AI-provided assistance, is offered for informational purposes only and does not constitute financial, legal, tax or investment advice. You are solely responsible for your investment decisions and should independently verify the data and seek professional advice before acting on it.",
  "Terms IP text":
    "The platform, software, design and trademarks are owned by us or our licensors. When you subscribe, you are granted a limited, non-exclusive and non-transferable license to use the service for your own internal purposes.",
  "Terms liability text":
    "To the maximum extent permitted by law, we will not be liable for indirect, incidental or consequential damages, or for investment losses arising from reliance on the data or responses of the service. Nothing in these Terms limits liability that cannot be excluded under applicable law, including liability for fraud or, for EU consumers, mandatory consumer protection rights.",
  "Terms termination text":
    "We may suspend or cancel accounts that breach these Terms. You can stop using the service and cancel your subscription at any time.",
  "Terms changes text":
    "We may update these Terms periodically. Continued use of the service after the changes take effect constitutes acceptance of the updated Terms. We will notify you of substantial changes through the website or by email.",
  "Terms law text":
    "These Terms are governed by Spanish law, without prejudice to the mandatory consumer protection rules of your country of residence that may apply if you are a consumer under EU law.",
  "Terms contact text": "For any questions about these Terms, contact us",

  // Política de Cookies
  "Cookies intro":
    "This Cookie Policy explains how MakeItRight uses cookies and similar technologies on our website.",
  "Cookies what text":
    "Cookies are small files stored on your device that help a website work and allow us to understand how it is used.",
  "Essential cookies":
    "Essential or strictly necessary — authentication and session management, security and saved preferences such as your language. They cannot be disabled because they are necessary for the service to work.",
  "Analytics cookies":
    "Analytics or performance — they help us understand usage and improve the product.",
  "Marketing cookies":
    "Advertising or marketing — they are used to measure and improve the performance of our ads; they are only loaded when allowed.",
  "Cookie Google": "Google Analytics (Google) — analytics.",
  "Cookie Vercel": "Vercel Analytics / Speed Insights (Vercel) — analytics and performance.",
  "Cookie Stripe": "Stripe — fraud prevention during payment.",
  "Cookie Supabase": "Supabase — authentication and session management.",
  "Cookie Clerk": "Clerk — authentication and session management.",
  "Cookies manage text":
    "You can adjust your browser settings to block or delete cookies at any time. Note that blocking essential cookies may affect key features, such as keeping you signed in.",
  "Cookies changes text":
    "We may update this Cookie Policy periodically and will notify you through the website or by email.",
  "Cookies contact text": "For any questions about this Cookie Policy, contact us",
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("es")

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "en" || saved === "es") {
      setLangState(saved)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem(STORAGE_KEY, newLang)
  }, [])

  const t = useCallback(
    (key: string) =>
      lang === "es"
        ? translations[key] ?? key
        : englishOverrides[key] ?? spanishToEnglish[key] ?? key,
    [lang],
  )

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
