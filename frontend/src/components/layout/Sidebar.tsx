'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Building2, Shield, Globe, Settings, LayoutDashboard, ChevronDown, X, Package, Warehouse, Tag, Layers, BookOpen, DollarSign, MapPin, Map, Code, Ruler, Grid3x3, Building, Percent, ShoppingCart, UserCheck, MapPinned, LayoutList, Handshake, ClipboardList, ListOrdered, Landmark, CreditCard, Briefcase, Truck, FileText, Banknote, Scale, ArrowLeftRight, BarChart3, Receipt, HardHat, UserCog, Network, Columns, Languages, GraduationCap, Award, Brain, Signal, CheckCircle, Wrench, FolderMinus, Heart, Wallet, Stethoscope, MapPinHouse, Ban, Home, CircleDollarSign, ShieldAlert, School, ScrollText, UsersRound, Calculator, ShoppingBag, BookMarked, FolderTree, Calendar, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Image from 'next/image';

const menu = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'General',
    icon: Settings,
    children: [
      { label: 'Operadores',   href: '/gen/operadores',   icon: Users },
      { label: 'Roles',        href: '/gen/roles',        icon: Shield },
      { label: 'Empresas',     href: '/gen/empresas',     icon: Building2 },
      { label: 'Sistemas',     href: '/gen/sistemas',     icon: Globe },
      { label: 'Programas',    href: '/gen/programas',    icon: Code },
      { label: 'Monedas',      href: '/gen/monedas',      icon: DollarSign },
      { label: 'Países',         href: '/gen/paises',          icon: MapPin },
      { label: 'Departamentos',  href: '/gen/departamentos',   icon: Map },
      { label: 'Distritos',      href: '/gen/distritos',       icon: MapPinHouse },
      { label: 'Localidades',    href: '/gen/localidades',     icon: Home },
      { label: 'Barrios',        href: '/gen/barrios',         icon: Building },
      { label: 'Profesiones',    href: '/gen/profesiones',     icon: Stethoscope },
      { label: 'Mot. anulación', href: '/gen/motivos-anulacion', icon: Ban },
      { label: 'Ciudades',       href: '/gen/ciudades',         icon: Building },
      { label: 'Impuestos',      href: '/gen/impuestos',        icon: Percent },
      { label: 'Tipos impuesto', href: '/gen/tipos-impuesto',   icon: Percent },
    ],
  },
  {
    label: 'Facturación',
    icon: ShoppingCart,
    children: [
      { label: 'Facturas',          href: '/fac/facturas',      icon: Receipt },
      { label: 'Pedidos',          href: '/fac/pedidos',       icon: ClipboardList },
      { label: 'Clientes',         href: '/fac/clientes',      icon: UserCheck },
      { label: 'Vendedores',       href: '/fac/vendedores',    icon: Handshake },
      { label: 'Campañas',         href: '/fac/campanhas',     icon: BarChart3 },
      { label: 'Comisiones',       href: '/fac/comisiones',    icon: Percent },
      { label: 'Sol. descuento',   href: '/fac/solicitudes-descuento', icon: ListOrdered },
      { label: 'Listas de precio', href: '/fac/listas-precio', icon: DollarSign },
      { label: 'Zonas',            href: '/fac/zonas',         icon: MapPinned },
      { label: 'Categorías',       href: '/fac/categorias',    icon: LayoutList },
      { label: 'Condiciones',      href: '/fac/condiciones',   icon: BookOpen },
      { label: 'Barrios',          href: '/fac/barrios',       icon: MapPin },
    ],
  },
  {
    label: 'Finanzas',
    icon: Landmark,
    children: [
      { label: 'Documentos',          href: '/fin/documentos',         icon: FileText },
      { label: 'Órdenes de pago',    href: '/fin/ordenes-pago',       icon: Receipt },
      { label: 'Cheques recibidos', href: '/fin/cheques',            icon: Banknote },
      { label: 'Cheques emitidos',  href: '/fin/cheques-emitidos',   icon: Banknote },
      { label: 'Proveedores',        href: '/fin/proveedores',        icon: Truck },
      { label: 'Cuentas bancarias', href: '/fin/cuentas-bancarias',  icon: CreditCard },
      { label: 'Cobradores',        href: '/fin/cobradores',         icon: UserCheck },
      { label: 'Períodos',          href: '/fin/periodos',           icon: Calendar },
      { label: 'Conceptos',         href: '/fin/conceptos',          icon: BookOpen },
      { label: 'Bancos',            href: '/fin/bancos',             icon: Landmark },
      { label: 'Formas de pago',    href: '/fin/formas-pago',        icon: DollarSign },
      { label: 'Ramos',             href: '/fin/ramos',              icon: Briefcase },
      { label: 'Tipos proveedor',   href: '/fin/tipos-proveedor',    icon: Tag },
      { label: 'Personerías',       href: '/fin/personeria',         icon: Scale },
      { label: 'Clases documento',  href: '/fin/clases-doc',         icon: Layers },
    ],
  },
  {
    label: 'Stock',
    icon: Package,
    children: [
      { label: 'Movimientos',       href: '/stk/movimientos',     icon: ArrowLeftRight },
      { label: 'Remisiones',        href: '/stk/remisiones',      icon: FileText },
      { label: 'Stock actual',      href: '/stk/stock',           icon: BarChart3 },
      { label: 'Artículos',        href: '/stk/articulos',       icon: Layers },
      { label: 'Depósitos',        href: '/stk/depositos',       icon: Warehouse },
      { label: 'Líneas',           href: '/stk/lineas',          icon: BookOpen },
      { label: 'Grupos',           href: '/stk/grupos',          icon: Grid3x3 },
      { label: 'Marcas',           href: '/stk/marcas',          icon: Tag },
      { label: 'Rubros',           href: '/stk/rubros',          icon: BookOpen },
      { label: 'Clasificaciones', href: '/stk/clasificaciones', icon: LayoutList },
      { label: 'Choferes',        href: '/stk/choferes',        icon: Truck },
      { label: 'Unidades de medida', href: '/stk/unidades-medida', icon: Ruler },
    ],
  },
  {
    label: 'Compras',
    icon: ShoppingBag,
    children: [
      { label: 'Órdenes compra', href: '/com/ordenes-compra', icon: ClipboardList },
      { label: 'Contratos prov.', href: '/com/contratos',      icon: ScrollText },
    ],
  },
  {
    label: 'Contabilidad',
    icon: BookMarked,
    children: [
      { label: 'Asientos',        href: '/cnt/asientos',       icon: PenLine },
      { label: 'Plan de cuentas', href: '/cnt/cuentas',        icon: FolderTree },
      { label: 'Ejercicios',      href: '/cnt/ejercicios',     icon: Calendar },
      { label: 'Grupos',          href: '/cnt/grupos',         icon: Layers },
      { label: 'Rubros',          href: '/cnt/rubros',         icon: Tag },
      { label: 'Centros de costo', href: '/cnt/centros-costo', icon: Building },
    ],
  },
  {
    label: 'Personal',
    icon: HardHat,
    children: [
      { label: 'Empleados',        href: '/per/empleados',       icon: Users },
      { label: 'Liquidaciones',   href: '/per/liquidaciones',   icon: Receipt },
      { label: 'Horarios',        href: '/per/horarios',        icon: Calendar },
      { label: 'Conc. empleado',  href: '/per/empl-conceptos',  icon: Calculator },
      { label: 'Ausencias',       href: '/per/ausencias',       icon: Ban },
      { label: 'Cargos',           href: '/per/cargos',          icon: UserCog },
      { label: 'Categorías',       href: '/per/categorias',      icon: LayoutList },
      { label: 'Áreas',            href: '/per/areas',           icon: Network },
      { label: 'Secciones',        href: '/per/secciones',       icon: Columns },
      { label: 'Turnos',           href: '/per/turnos',          icon: ClipboardList },
      { label: 'Tipos contrato',   href: '/per/tipos-contrato',  icon: FileText },
      { label: 'Mot. ausencia',    href: '/per/motivos-ausencia',icon: BookOpen },
      { label: 'Formas de pago',   href: '/per/formas-pago',     icon: CreditCard },
      { label: 'Tipos liquidación',href: '/per/tipos-liquidacion',icon: Wallet },
      { label: 'Tipos de pago',   href: '/per/tipos-pago',      icon: Banknote },
      { label: 'Tipos familiar',  href: '/per/tipos-familiar',  icon: Heart },
      { label: 'Idiomas',         href: '/per/idiomas',         icon: Languages },
      { label: 'Carreras',        href: '/per/carreras',        icon: GraduationCap },
      { label: 'Bachilleratos',   href: '/per/bachilleratos',   icon: Award },
      { label: 'Capacitaciones',  href: '/per/capacitaciones',  icon: Brain },
      { label: 'Niveles capac.',  href: '/per/niveles-capacitacion', icon: Signal },
      { label: 'Est. estudio',    href: '/per/estados-estudio', icon: CheckCircle },
      { label: 'Funciones',       href: '/per/funciones',       icon: Wrench },
      { label: 'Clasif. descuento', href: '/per/clasificaciones-descuento', icon: FolderMinus },
      { label: 'Tipos salario',   href: '/per/tipos-salario',       icon: CircleDollarSign },
      { label: 'Mot. licencia',   href: '/per/motivos-licencia',    icon: ShieldAlert },
      { label: 'Inst. educativas', href: '/per/inst-educativas',    icon: School },
      { label: 'Contratos',       href: '/per/contratos',          icon: ScrollText },
      { label: 'Familiares',      href: '/per/familiares',         icon: UsersRound },
      { label: 'Conceptos liq.',  href: '/per/conceptos',          icon: Calculator },
    ],
  },
];

interface Props {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: Props) {
  const pathname = usePathname();

  const initialOpen = menu
    .filter((item) => item.children?.some((child) => pathname.startsWith(child.href)))
    .map((item) => item.label);

  const [open, setOpen] = useState<string[]>(initialOpen.length ? initialOpen : []);

  const toggleGroup = (label: string) => {
    setOpen((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <aside className="w-56 h-full bg-gray-900 text-gray-100 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" />
          <span className="text-xl font-bold text-white">JWF</span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden text-gray-400 hover:text-white transition"
          aria-label="Cerrar menú"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {menu.map((item) => {
          if (!item.children) {
            return (
              <Link
                key={item.href}
                href={item.href!}
                onClick={handleNavClick}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition',
                  pathname === item.href
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                )}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          }

          const isOpen = open.includes(item.label);
          return (
            <div key={item.label}>
              <button
                onClick={() => toggleGroup(item.label)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition"
              >
                <span className="flex items-center gap-3">
                  <item.icon size={16} />
                  {item.label}
                </span>
                <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
              </button>
              {isOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={handleNavClick}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition',
                        pathname.startsWith(child.href)
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                      )}
                    >
                      <child.icon size={14} />
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
