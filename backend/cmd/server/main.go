package main

import (
	"log"

	"github.com/kmj36/Tech-Blog-FieldNotes-/internal/app"
)

func main() {
	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
