/*
* A tailwinds config file used to generate atomic utility css classes.
* See: https://tailwindcss.com/docs/configuration/
* Def: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
*/

module.exports = {
    purge: [
        "./src/**/*.html",
        "./src/**/*.js",
        "./src/**/*.jsx",
        "./src/**/*.ts",
        "./src/**/*.tsx",
    ],
    theme: {
        extend: {
            colors: {
                "bg": "#121212",
                "primary": "#212121",
                "secondary": "#272727",
                "navbar": "#2E2E2E",
                "accent": "#7614F5",
                "error": "#CF6679",
                "success": "#1FDC98",
                "warning": "#D5AC5C",
                "subtle": "#464646"
            }
        },
    },
    variants: {
        backgroundColor: ['hover', 'focus'],
        textColor: ['hover', 'focus'],
        borderColor: ['focus', 'hover'],
        fontWeight:['hover', 'focus'],
        padding:['hover', 'focus']
    },
    plugins: [],
}
