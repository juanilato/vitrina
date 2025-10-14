import React from 'react';

// ====== ÍCONOS MUI ======
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import SetMealIcon from '@mui/icons-material/SetMeal';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import KebabDiningIcon from '@mui/icons-material/KebabDining';
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill';
import EggIcon from '@mui/icons-material/Egg';
import BakeryDiningIcon from '@mui/icons-material/BakeryDining';
import IcecreamIcon from '@mui/icons-material/Icecream';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import RamenDiningIcon from '@mui/icons-material/RamenDining';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';
import RiceBowlIcon from '@mui/icons-material/RiceBowl';
import BrunchDiningIcon from '@mui/icons-material/BrunchDining';
import BreakfastDiningIcon from '@mui/icons-material/BreakfastDining';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import FlatwareIcon from '@mui/icons-material/Flatware';
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import LiquorIcon from '@mui/icons-material/Liquor';
import WineBarIcon from '@mui/icons-material/WineBar';
import SportsBarIcon from '@mui/icons-material/SportsBar';
import BlenderIcon from '@mui/icons-material/Blender';
import CoffeeIcon from '@mui/icons-material/Coffee';

// Vegetales / Naturales
import GrassIcon from '@mui/icons-material/Grass';
import SpaIcon from '@mui/icons-material/Spa';
import ForestIcon from '@mui/icons-material/Forest';
import GrainIcon from '@mui/icons-material/Grain';
import YardIcon from '@mui/icons-material/Yard';

// Contenedores / Almacenamiento
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import KitchenIcon from '@mui/icons-material/Kitchen';
import BentoIcon from '@mui/icons-material/Bento';
import TakeoutDiningIcon from '@mui/icons-material/TakeoutDining';

// Limpieza / Químicos
import ScienceIcon from '@mui/icons-material/Science';
import OpacityIcon from '@mui/icons-material/Opacity';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SoapIcon from '@mui/icons-material/Soap';
import SanitizerIcon from '@mui/icons-material/Sanitizer';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import OilBarrelIcon from '@mui/icons-material/OilBarrel';
import WhatshotIcon from '@mui/icons-material/Whatshot';

// Herramientas / Taller / Autopartes
import BuildIcon from '@mui/icons-material/Build';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import HandymanIcon from '@mui/icons-material/Handyman';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';

// Electrónica / Eléctrico
import MemoryIcon from '@mui/icons-material/Memory';
import BoltIcon from '@mui/icons-material/Bolt';
import CableIcon from '@mui/icons-material/Cable';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';

// Salud / Farmacia / Cosmética
import MedicationIcon from '@mui/icons-material/Medication';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import HealingIcon from '@mui/icons-material/Healing';
import ColorizeIcon from '@mui/icons-material/Colorize';
import BrushIcon from '@mui/icons-material/Brush';

// Textil / Hogar
import CheckroomIcon from '@mui/icons-material/Checkroom';
import StorefrontIcon from '@mui/icons-material/Storefront';

// Misceláneos
import LocalGroceryStoreOutlinedIcon from '@mui/icons-material/LocalGroceryStoreOutlined';

// ====== ÍCONOS PERSONALIZADOS (SVG en /public/ingredients) ======

export const ingredientIcons = {
  banana: '/ingredients/banana-svgrepo-com.svg',
  bellPepper: '/ingredients/bell-pepper-vegetable-svgrepo-com.svg',
  salmon: '/ingredients/big-salmon-svgrepo-com.svg',
  broccoli: '/ingredients/broccoli-outline-svgrepo-com.svg',
  carrot: '/ingredients/carrot-organic-svgrepo-com.svg',
  cheese: '/ingredients/cheese-svgrepo-com.svg',
  chickenLeg: '/ingredients/chicken-leg-svgrepo-com.svg',
  corn: '/ingredients/corn-svgrepo-com.svg',
  egg: '/ingredients/egg-svgrepo-com.svg',
  garlic: '/ingredients/garlic-3-svgrepo-com.svg',
  grains: '/ingredients/grains-wheat-svgrepo-com.svg',
  grapes: '/ingredients/grapes-svgrepo-com.svg',
  lemon: '/ingredients/lemon-svgrepo-com.svg',
  lettuce: '/ingredients/lettuce-organic-svgrepo-com.svg',
  milkBottle: '/ingredients/milk-bottle-svgrepo-com.svg',
  mushroom: '/ingredients/mushroom-1-up-videogame-svgrepo-com.svg',
  oilBottle: '/ingredients/oil-bottle-svgrepo-com.svg',
  onion: '/ingredients/onion-svgrepo-com.svg',
  prawn: '/ingredients/prawn-svgrepo-com.svg',
  rice: '/ingredients/rice-svgrepo-com.svg',
  soySauce: '/ingredients/soy-sauce-svgrepo-com.svg',
  spaghetti: '/ingredients/spaghetti-bolognese-svgrepo-com.svg',
  steak: '/ingredients/steak-meat-svgrepo-com.svg',
  strawberry: '/ingredients/strawberry-svgrepo-com.svg',
  tomato: '/ingredients/tomato-svgrepo-com.svg',
  wheat: '/ingredients/wheat-harvest-svgrepo-com.svg',
};

export type IngredientIconName = keyof typeof ingredientIcons;

// Componente renderizador para los SVG
const IngredientIconComponent: React.FC<{ name: IngredientIconName; size?: number }> = ({ name, size = 28 }) => (
  <img
    src={process.env.PUBLIC_URL + ingredientIcons[name]}
    alt={name}
    width={size}
    height={size}
    loading="lazy"
    style={{
      display: 'inline-block',
      objectFit: 'contain',
      verticalAlign: 'middle',
      filter: 'drop-shadow(0 0 0.5px rgba(0,0,0,0.2))',
    }}
  />
);

// ✅ Y luego generá los íconos dinámicos así:
const svgEntries = Object.entries(ingredientIcons).map(([key]) => [
  key,
  () => <IngredientIconComponent name={key as IngredientIconName} />,
]);

// ====== REGISTRO GLOBAL DE ÍCONOS ======

export type IconName =
  | 'Restaurant' | 'Fastfood' | 'LocalDining' | 'SetMeal' | 'LunchDining' | 'KebabDining' | 'OutdoorGrill'
  | 'Egg' | 'BakeryDining' | 'Icecream' | 'LocalPizza' | 'RamenDining' | 'SoupKitchen' | 'RiceBowl'
  | 'BrunchDining' | 'BreakfastDining' | 'DinnerDining' | 'Flatware' | 'EmojiFoodBeverage' | 'LocalCafe'
  | 'FreeBreakfast' | 'LocalDrink' | 'Liquor' | 'WineBar' | 'SportsBar' | 'Blender' | 'Coffee'
  | 'Grass' | 'Spa' | 'Forest' | 'Grain' | 'Yard'
  | 'Inventory2Outlined' | 'Inventory' | 'Category' | 'Kitchen' | 'Bento' | 'TakeoutDining'
  | 'Science' | 'Opacity' | 'WaterDrop' | 'Soap' | 'Sanitizer' | 'LocalLaundryService' | 'OilBarrel' | 'Whatshot'
  | 'Build' | 'BuildCircle' | 'Handyman' | 'PrecisionManufacturing' | 'MiscellaneousServices' | 'ElectricBolt'
  | 'Memory' | 'Bolt' | 'Cable' | 'Lightbulb' | 'BatteryChargingFull'
  | 'Medication' | 'Vaccines' | 'Healing' | 'Colorize' | 'Brush'
  | 'Checkroom' | 'Storefront' | 'LocalGroceryStoreOutlined'
  // nuevos nombres SVG
  | IngredientIconName;

export const iconRegistry: Record<IconName, React.ElementType> = {
  // ÍCONOS MUI...
  Restaurant: RestaurantIcon,
  Fastfood: FastfoodIcon,
  LocalDining: LocalDiningIcon,
  SetMeal: SetMealIcon,
  LunchDining: LunchDiningIcon,
  KebabDining: KebabDiningIcon,
  OutdoorGrill: OutdoorGrillIcon,
  Egg: EggIcon,
  BakeryDining: BakeryDiningIcon,
  Icecream: IcecreamIcon,
  LocalPizza: LocalPizzaIcon,
  RamenDining: RamenDiningIcon,
  SoupKitchen: SoupKitchenIcon,
  RiceBowl: RiceBowlIcon,
  BrunchDining: BrunchDiningIcon,
  BreakfastDining: BreakfastDiningIcon,
  DinnerDining: DinnerDiningIcon,
  Flatware: FlatwareIcon,
  EmojiFoodBeverage: EmojiFoodBeverageIcon,
  LocalCafe: LocalCafeIcon,
  FreeBreakfast: FreeBreakfastIcon,
  LocalDrink: LocalDrinkIcon,
  Liquor: LiquorIcon,
  WineBar: WineBarIcon,
  SportsBar: SportsBarIcon,
  Blender: BlenderIcon,
  Coffee: CoffeeIcon,

  Grass: GrassIcon,
  Spa: SpaIcon,
  Forest: ForestIcon,
  Grain: GrainIcon,
  Yard: YardIcon,

  Inventory2Outlined: Inventory2OutlinedIcon,
  Inventory: InventoryIcon,
  Category: CategoryIcon,
  Kitchen: KitchenIcon,
  Bento: BentoIcon,
  TakeoutDining: TakeoutDiningIcon,

  Science: ScienceIcon,
  Opacity: OpacityIcon,
  WaterDrop: WaterDropIcon,
  Soap: SoapIcon,
  Sanitizer: SanitizerIcon,
  LocalLaundryService: LocalLaundryServiceIcon,
  OilBarrel: OilBarrelIcon,
  Whatshot: WhatshotIcon,

  Build: BuildIcon,
  BuildCircle: BuildCircleIcon,
  Handyman: HandymanIcon,
  PrecisionManufacturing: PrecisionManufacturingIcon,
  MiscellaneousServices: MiscellaneousServicesIcon,
  ElectricBolt: ElectricBoltIcon,

  Memory: MemoryIcon,
  Bolt: BoltIcon,
  Cable: CableIcon,
  Lightbulb: LightbulbIcon,
  BatteryChargingFull: BatteryChargingFullIcon,

  Medication: MedicationIcon,
  Vaccines: VaccinesIcon,
  Healing: HealingIcon,
  Colorize: ColorizeIcon,
  Brush: BrushIcon,

  Checkroom: CheckroomIcon,
  Storefront: StorefrontIcon,
  LocalGroceryStoreOutlined: LocalGroceryStoreOutlinedIcon,

  // ✅ mantené solo esta línea para los SVG dinámicos:
  ...Object.fromEntries(svgEntries),
};

// ====== CATEGORÍAS ======

export const iconCategories: Array<{
  key: string;
  label: string;
  items: IconName[];
}> = [
  {
    key: 'food',
    label: 'Alimentos',
    items: [
      'Restaurant','Fastfood','LocalDining','SetMeal','LunchDining','KebabDining','OutdoorGrill',
      'Egg','BakeryDining','Icecream','LocalPizza','RamenDining','SoupKitchen','RiceBowl',
      'BrunchDining','BreakfastDining','DinnerDining','Flatware','EmojiFoodBeverage',
      'LocalCafe','FreeBreakfast','LocalDrink','Liquor','WineBar','SportsBar','Blender','Coffee',
      // Agregamos íconos SVG comestibles
      'banana','bellPepper','salmon','broccoli','carrot','cheese','chickenLeg','corn','egg','garlic',
      'grains','grapes','lemon','lettuce','milkBottle','mushroom','oilBottle','onion','prawn','rice',
      'soySauce','spaghetti','steak','strawberry','tomato','wheat',
    ],
  },
  {
    key: 'natural',
    label: 'Vegetales / Naturales',
    items: ['Grass','Spa','Forest','Grain','Yard'],
  },
  {
    key: 'storage',
    label: 'Envases / Contenedores',
    items: ['Inventory2Outlined','Inventory','Category','Kitchen','Bento','TakeoutDining'],
  },
  {
    key: 'chem',
    label: 'Limpieza / Químicos',
    items: ['Science','Opacity','WaterDrop','Soap','Sanitizer','LocalLaundryService','OilBarrel','Whatshot'],
  },
  {
    key: 'tools',
    label: 'Herramientas / Taller',
    items: ['Build','BuildCircle','Handyman','PrecisionManufacturing','MiscellaneousServices','ElectricBolt'],
  },
  {
    key: 'electrical',
    label: 'Eléctrico / Electrónica',
    items: ['Memory','Bolt','Cable','Lightbulb','BatteryChargingFull'],
  },
  {
    key: 'health',
    label: 'Salud / Cosmética',
    items: ['Medication','Vaccines','Healing','Colorize','Brush'],
  },
  {
    key: 'textile',
    label: 'Textil / Retail',
    items: ['Checkroom','Storefront','LocalGroceryStoreOutlined'],
  },
];
