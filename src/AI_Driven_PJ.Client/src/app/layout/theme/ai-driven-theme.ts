import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const brandPrimary = {
    50: '#fff7f0',
    100: '#ffeade',
    200: '#ffd0b5',
    300: '#ffa87a',
    400: '#ff8342',
    500: '#FF6D1F', // Brand Primary Orange
    600: '#e0530d',
    700: '#b83e07',
    800: '#913005',
    900: '#732707',
    950: '#421401'
};

export const brandSurfaceLight = {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
};

export const brandSurfaceDark = {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#2d2d2d',
    900: '#222222', // Brand Secondary Dark Mode Surface
    950: '#161616' // Darkest mode base background
};

const AiDrivenTheme = definePreset(Aura, {
    primitive: {
        rixs: brandPrimary
    },
    semantic: {
        primary: brandPrimary,
        colorScheme: {
            light: {
                surface: brandSurfaceLight,
                primary: {
                    color: '{primary.500}',
                    contrastColor: '#ffffff',
                    hoverColor: '{primary.600}',
                    activeColor: '{primary.700}'
                },
                highlight: {
                    background: '{primary.50}',
                    focusBackground: '{primary.100}',
                    color: '{primary.700}',
                    focusColor: '{primary.800}'
                }
            },
            dark: {
                surface: brandSurfaceDark,
                primary: {
                    color: '{primary.400}',
                    contrastColor: '{surface.950}',
                    hoverColor: '{primary.300}',
                    activeColor: '{primary.200}'
                },
                highlight: {
                    background: 'color-mix(in srgb, {primary.400}, transparent 76%)',
                    focusBackground: 'color-mix(in srgb, {primary.300}, transparent 68%)',
                    color: '#ffffff',
                    focusColor: '#ffffff'
                }
            }
        }
    },
    components: {
        button: {
            colorScheme: {
                light: {
                    root: {
                        secondary: {
                            background: '#222222',
                            hoverBackground: '#333333',
                            activeBackground: '#111111',
                            borderColor: '#222222',
                            hoverBorderColor: '#333333',
                            activeBorderColor: '#111111',
                            color: '#ffffff',
                            hoverColor: '#ffffff',
                            activeColor: '#ffffff'
                        }
                    }
                },
                dark: {
                    root: {
                        secondary: {
                            background: '{surface.800}',
                            hoverBackground: '{surface.700}',
                            activeBackground: '{surface.900}',
                            borderColor: '{surface.800}',
                            hoverBorderColor: '{surface.700}',
                            activeBorderColor: '{surface.900}',
                            color: '#ffffff',
                            hoverColor: '#ffffff',
                            activeColor: '#ffffff'
                        }
                    }
                }
            }
        },
        tag: {
            colorScheme: {
                light: {
                    secondary: {
                        background: '#222222',
                        color: '#ffffff'
                    }
                },
                dark: {
                    secondary: {
                        background: '{surface.800}',
                        color: '{surface.100}'
                    }
                }
            }
        }
    }
});

export default AiDrivenTheme;
