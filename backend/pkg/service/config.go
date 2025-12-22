package service

import (
	"flag"
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	Port          int
	AllowCORS     bool
	EnableSwagger bool
}

// NOTE FOR REVIEWER:
// For simplicity, this program uses simple environment variable settings
// without the help of libraries. Alternatively, we could use spf13/cobra or
// spf13/viper to take advantage of command line flags and config YAML/JSON
// files, leading to interesting trade-offs. The final version depends on
// Sezzle's common engineering practices.
func ParseEnvVars() Config {
	p := &parser{
		ExitFn: os.Exit,
	}
	return p.Parse(os.Args)
}

type parser struct {
	ExitFn func(int)
}

func (p *parser) Parse(args []string) Config {
	fs := flag.NewFlagSet(args[0], flag.ContinueOnError)
	out := fs.Output()

	fs.Usage = func() {
		fmt.Fprintf(out, "Usage of %s:\n", args[0])
		fs.PrintDefaults()
		fmt.Fprintln(out, "\nEnvironment variables:")
		fmt.Fprintln(out, "  PORT        port to listen on (default: 3001)")
		fmt.Fprintln(out, "  ALLOW_CORS      set to 'true' to enable CORS headers (default: false)")
		fmt.Fprintln(out, "  ENABLE_SWAGGER  set to 'true' to enable Swagger UI (default: false)")
	}
	help := fs.Bool("help", false, "print help and exit")
	_ = fs.Parse(args[1:])
	if *help {
		fs.Usage()
		p.ExitFn(0)
	}

	errorFn := func(msg string) {
		fmt.Fprintf(out, "Error: %s\n", msg)
		p.ExitFn(1)
	}
	return Config{
		Port:          getEnv("PORT", 3001, strconv.Atoi, errorFn),
		AllowCORS:     getEnv("ALLOW_CORS", false, strconv.ParseBool, errorFn),
		EnableSwagger: getEnv("ENABLE_SWAGGER", false, strconv.ParseBool, errorFn),
	}
}

func getEnv[T any](name string, defaultVal T, parse func(string) (T, error), errorFn func(string)) T {
	v := os.Getenv(name)
	if v == "" {
		return defaultVal
	}
	val, err := parse(v)
	if err != nil {
		errorFn(fmt.Sprintf("invalid %s value: %s", name, v))
		return defaultVal
	}
	return val
}
