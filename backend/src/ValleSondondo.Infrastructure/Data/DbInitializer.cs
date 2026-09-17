using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ValleSondondo.Domain.Entities;

namespace ValleSondondo.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(ValleSondondoDbContext context)
    {
        // Ensure database is created and migrations applied
        await context.Database.MigrateAsync();

        if (await context.Categories.AnyAsync())
        {
            return; // DB has been seeded
        }

        // 1. Categories
        var catCondor = new Category
        {
            Name = "Ruta del Cóndor (Kuntur Ñan)",
            Slug = "ruta-del-condor",
            Description = "Avistamiento privilegiado del majestuoso Cóndor Andino en vuelo libre sobre los cañones de Mayobamba y Aucará.",
            Icon = "feather",
            DisplayOrder = 1
        };

        var catCultura = new Category
        {
            Name = "Cultura Viva y Andenes Preíncas",
            Slug = "cultura-viva-andenes",
            Description = "Explora el mayor sistema de andenerías agrícolas vivas del mundo, cuna de la Danza de las Tijeras y pueblos coloniales.",
            Icon = "landmark",
            DisplayOrder = 2
        };

        var catMontana = new Category
        {
            Name = "Aventura y Alta Montaña",
            Slug = "aventura-alta-montana",
            Description = "Trekking épico hacia los glaciares del Apu Qarhuarazo (5,112 msnm), bofedales con vicuñas y lagunas cristalinas.",
            Icon = "mountain",
            DisplayOrder = 3
        };

        var catTermal = new Category
        {
            Name = "Aguas Termales & Cañones",
            Slug = "aguas-termales-canones",
            Description = "Relax medicinal en fuentes termales naturales de Huancas Puquio y Gollpa, rodeadas de imponentes cataratas.",
            Icon = "droplets",
            DisplayOrder = 4
        };

        await context.Categories.AddRangeAsync(catCondor, catCultura, catMontana, catTermal);
        await context.SaveChangesAsync();

        // 2. Tours
        var tour1 = new Tour
        {
            Title = "Kuntur Ñan: El Majestuoso Vuelo del Cóndor",
            Slug = "kuntur-nan-vuelo-del-condor",
            Subtitle = "Avistamiento en primer plano del Cóndor Andino en los miradores sagrados de Mayobamba",
            Description = "Vive una experiencia sobrecogedora al contemplar al rey de los Andes en su hábitat salvaje. Desde el mirador natural de Mayobamba y Aucará, serás testigo del planeo de cóndores andinos a pocos metros de distancia sobre los profundos abismos del Valle del Sondondo. La jornada incluye visita a la laguna sagrada de Ccochapanpa, guiado ornitológico especializado y un reconfortante almuerzo tradicional andino.",
            CategoryId = catCondor.Id,
            Duration = "Full Day (8:00 AM - 4:30 PM)",
            DurationDays = 1,
            PriceSoles = 140.00m,
            PriceUsd = 38.00m,
            Difficulty = "Fácil a Moderado",
            AltitudeMax = "3,400 msnm",
            StartingPoint = "Aucará / Puquio / Cabana Sur",
            Featured = true,
            DisplayOrder = 1,
            MainImageUrl = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
            GalleryImagesJson = JsonSerializer.Serialize(new[]
            {
                "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80"
            }),
            IncludedJson = JsonSerializer.Serialize(new[]
            {
                "Transporte turístico privado ida y vuelta desde punto de encuentro",
                "Guía local bilingüe y certificado en fauna andina",
                "Préstamo de binoculares de observación de alta definición",
                "Almuerzo andino campestre (opciones trucha o vegetariano)",
                "Bebidas calientes (mate de muña y coca para aclimatación)",
                "Botiquín de primeros auxilios y balón de oxígeno medicinal",
                "Tickets de ingreso a áreas comunitarias protegidas"
            }),
            NotIncludedJson = JsonSerializer.Serialize(new[]
            {
                "Desayuno previo al tour",
                "Snacks personales adicionales",
                "Propinas voluntarias para el guía local"
            }),
            RecommendationsJson = JsonSerializer.Serialize(new[]
            {
                "Llevar ropa abrigadora en capas (cortaviento, polar)",
                "Zapatos de trekking con buen agarre",
                "Protector solar SPF 50+, lentes con filtro UV y sombrero de ala ancha",
                "Cámara fotográfica con lente teleobjetivo si dispone",
                "Llevar agua para hidratación constante"
            })
        };

        var tour2 = new Tour
        {
            Title = "Gran Circuito Andenes Vivos de Andamarca y Danzantes de Tijeras",
            Slug = "andenes-vivos-andamarca-danzantes-de-tijeras",
            Subtitle = "Inmersión cultural en el anfiteatro preínca vivo más colosal del Perú y cuna de la mística andina",
            Description = "El Valle del Sondondo alberga más de 5,000 hectáreas de andenerías prehispánicas que continúan cultivándose con la sabiduría de los gentiles y de la cultura Wari e Inca. En este viaje de 2 días descubrirás la 'Casa del Saber de los Antamarkas', el sitio arqueológico de Caniche, el Templo Colonial de Cabana Sur y una demostración íntima y exclusiva de la ancestral Danza de las Tijeras (Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO).",
            CategoryId = catCultura.Id,
            Duration = "2 Días / 1 Noche",
            DurationDays = 2,
            PriceSoles = 320.00m,
            PriceUsd = 88.00m,
            Difficulty = "Fácil a Moderado",
            AltitudeMax = "3,500 msnm",
            StartingPoint = "Puquio o Aucará",
            Featured = true,
            DisplayOrder = 2,
            MainImageUrl = "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80",
            GalleryImagesJson = JsonSerializer.Serialize(new[]
            {
                "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80"
            }),
            IncludedJson = JsonSerializer.Serialize(new[]
            {
                "Transporte en minivan turística privada durante todo el recorrido",
                "1 Noche de alojamiento en posada rural con encanto en Andamarca",
                "Alimentación completa (1 desayuno, 2 almuerzos andinos, 1 cena)",
                "Demostración vivencial de Danza de las Tijeras con maestro galas",
                "Guiado histórico e interpretación cultural por expertos comunales",
                "Boletos de ingreso a museos y complejos arqueológicos",
                "Atención personalizada y asistencia 24/7"
            }),
            NotIncludedJson = JsonSerializer.Serialize(new[]
            {
                "Bebidas alcohólicas y gastos personales",
                "Souvenirs artesanales de lana de alpaca"
            }),
            RecommendationsJson = JsonSerializer.Serialize(new[]
            {
                "Ropa cómoda para caminar y abrigo para las noches andinas",
                "Batería externa para teléfono/cámara (hermosos paisajes fotográficos)",
                "Dinero en efectivo en soles para comprar artesanías directamente a las tejedoras"
            })
        };

        var tour3 = new Tour
        {
            Title = "Expedición Sagrada al Apu Qarhuarazo (5,112 msnm)",
            Slug = "expedicion-sagrada-apu-qarhuarazo",
            Subtitle = "Trek de alta montaña hacia el volcán tutelar, bofedales de vicuñas y lagunas glaciares",
            Description = "Para los amantes del senderismo de montaña y la espiritualidad andina: asciende a los pies del imponente nevado Apu Qarhuarazo (Qarwarasu), la deidad protectora de todo el Valle del Sondondo y Lucanas. Caminarás entre manadas de vicuñas silvestres, bofedales habitados por aves altoandinas y glaciares relictos. Celebraremos un tradicional 'Pago a la Tierra' guiado por un pampa misayoc y acamparemos bajo uno de los cielos estrellados más limpios del planeta.",
            CategoryId = catMontana.Id,
            Duration = "3 Días / 2 Noches",
            DurationDays = 3,
            PriceSoles = 540.00m,
            PriceUsd = 148.00m,
            Difficulty = "Exigente (Trekking de Altura)",
            AltitudeMax = "5,112 msnm",
            StartingPoint = "Aucará o Chipao",
            Featured = true,
            DisplayOrder = 3,
            MainImageUrl = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
            GalleryImagesJson = JsonSerializer.Serialize(new[]
            {
                "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1000&q=80"
            }),
            IncludedJson = JsonSerializer.Serialize(new[]
            {
                "Transporte 4x4 especializado para pistas de montaña",
                "Guía de alta montaña certificado AGMP / UIAGM",
                "Equipo completo de campamento cuatro estaciones (carpas térmicas, colchonetas)",
                "Cocinero de montaña y pensión completa los 3 días",
                "Caballos de carga para el equipaje pesado y equipo común",
                "Ceremonia andina de ofrenda y respeto a la Pachamama",
                "Pulsioxímetro, oxígeno medicinal y radiocomunicación VHF"
            }),
            NotIncludedJson = JsonSerializer.Serialize(new[]
            {
                "Bolsa de dormir (sleeping bag -10°C, disponible para alquiler)",
                "Bastones de trekking (disponibles para alquiler)",
                "Seguro de viaje contra accidentes de alta montaña"
            }),
            RecommendationsJson = JsonSerializer.Serialize(new[]
            {
                "Indispensable aclimatación previa de al menos 2 días por encima de 3,000m",
                "Ropa técnica de montaña (primera capa térmica, polar, chaqueta cortavientos Gore-Tex)",
                "Guantes térmicos, gorro de lana andina y calcetines gruesos",
                "Linterna frontal con pilas de repuesto"
            })
        };

        var tour4 = new Tour
        {
            Title = "Ruta Termo-Medicinal, Cañones y Catarata Limayhuacho",
            Slug = "ruta-termal-canones-catarata-limayhuacho",
            Subtitle = "Desconexión total en piscinas termales volcánicas y senderismo por cascadas ocultas",
            Description = "Un día revitalizante dedicado al bienestar físico y la comunión con las aguas sagradas de Sondondo. Disfruta de un relajante baño en las fuentes termales de Huancas Puquio y Gollpa, cuyas aguas ricas en minerales brotan a más de 38°C ideales para la relajación muscular y articular. Luego, emprenderemos una suave caminata por el cañón hasta la espectacular Catarata de Limayhuacho.",
            CategoryId = catTermal.Id,
            Duration = "Full Day (8:30 AM - 5:00 PM)",
            DurationDays = 1,
            PriceSoles = 120.00m,
            PriceUsd = 33.00m,
            Difficulty = "Fácil",
            AltitudeMax = "3,200 msnm",
            StartingPoint = "Aucará / Cabana Sur",
            Featured = false,
            DisplayOrder = 4,
            MainImageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
            GalleryImagesJson = JsonSerializer.Serialize(new[]
            {
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1000&q=80"
            }),
            IncludedJson = JsonSerializer.Serialize(new[]
            {
                "Transporte turístico privado para todo el itinerario",
                "Entrada a los baños termales medicinales de Huancas Puquio y Gollpa",
                "Guía local conocedor de las propiedades botánicas y medicinales",
                "Almuerzo típico regional con productos orgánicos del valle",
                "Degustación de quesos andinos madurados de la cuenca de Sondondo"
            }),
            NotIncludedJson = JsonSerializer.Serialize(new[]
            {
                "Toallas personales y ropa de baño",
                "Masajes o servicios adicionales en las termas"
            }),
            RecommendationsJson = JsonSerializer.Serialize(new[]
            {
                "Llevar ropa de baño, toalla de secado rápido y sandalias",
                "Ropa ligera para el día y un abrigo ligero para el retorno",
                "Bolsa impermeable para dispositivos móviles"
            })
        };

        var tour5 = new Tour
        {
            Title = "Gran Travesía Valle del Sondondo: Tesoro Escondido de Ayacucho",
            Slug = "gran-travesia-valle-del-sondondo",
            Subtitle = "El circuito más completo: Cóndores, Andenerías, Termales, Pueblos Mágicos y Gastronomía",
            Description = "La travesía definitiva de 4 días y 3 noches para quienes quieren explorar a fondo uno de los secretos mejor guardados de los Andes peruanos. Cubre Aucará, Andamarca, Cabana Sur, Chipao, Mayobamba y Puquio. Combina avistamiento de cóndores, baños termales, senderos incas, templos con retablos coloniales y convivencia con comunidades quechuas campesinas galardonadas como Guardianes de la Biodiversidad.",
            CategoryId = catCultura.Id,
            Duration = "4 Días / 3 Noches",
            DurationDays = 4,
            PriceSoles = 720.00m,
            PriceUsd = 195.00m,
            Difficulty = "Moderado",
            AltitudeMax = "3,650 msnm",
            StartingPoint = "Puquio, Nasca o Ayacucho",
            Featured = true,
            DisplayOrder = 5,
            MainImageUrl = "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80",
            GalleryImagesJson = JsonSerializer.Serialize(new[]
            {
                "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1000&q=80"
            }),
            IncludedJson = JsonSerializer.Serialize(new[]
            {
                "Transporte privado exclusivo durante los 4 días de expedición",
                "3 noches de alojamiento en hoteles y posadas turísticas seleccionadas",
                "Todas las comidas incluidas (desayunos, almuerzos campestres, cenas)",
                "Guía oficial de turismo residente con amplia experiencia en la zona",
                "Ingresos a todos los atractivos, miradores, termas y sitios arqueológicos",
                "Noche cultural con música andina tradicional en vivo y cata de pisco",
                "Seguro de asistencia médica local y botiquín completo"
            }),
            NotIncludedJson = JsonSerializer.Serialize(new[]
            {
                "Pasajes aéreos o interprovinciales hasta Puquio/Nasca (podemos coordinar traslados)"
            }),
            RecommendationsJson = JsonSerializer.Serialize(new[]
            {
                "Llevar maleta pequeña o mochila de 40L para mayor comodidad en traslados",
                "Disposición para desconectarse y disfrutar de la calidez de la comunidad andina"
            })
        };

        await context.Tours.AddRangeAsync(tour1, tour2, tour3, tour4, tour5);
        await context.SaveChangesAsync();

        // 3. Itineraries
        var it1_1 = new ItineraryDay
        {
            TourId = tour1.Id,
            DayNumber = 1,
            Title = "Rumbo al Cañón de Mayobamba y Ccochapanpa",
            Description = "Partida temprana desde el hotel hacia el mirador natural de Mayobamba. Despliegue de binoculares y telescopios para observar el vuelo matutino de los cóndores andinos. Caminata suave hacia la laguna sagrada de Ccochapanpa y almuerzo campestre con vista panorámica del cañón.",
            Activities = "Avistamiento ornitológico de cóndores, fotografía de paisaje, interpretación de flora andina y charla sobre conservación.",
            Meals = "Almuerzo campestre andino, mates calientes de hierbas medicinales.",
            Accommodation = "Retorno a hotel de origen al finalizar la tarde."
        };

        var it2_1 = new ItineraryDay
        {
            TourId = tour2.Id,
            DayNumber = 1,
            Title = "Aucará y Andenerías Majestuosas de Andamarca",
            Description = "Salida con dirección al distrito histórico de Andamarca. Recorrido por el colosal sistema de terrazas agrícolas escalonadas prehispánicas. Visita a la Casa del Saber de los Antamarkas y al centro arqueológico de Caniche.",
            Activities = "Caminata por senderos preíncas, visita a museo comunal, diálogo con agricultores locales sobre semillas andinas.",
            Meals = "Almuerzo típico en Andamarca, cena comunitaria tradicional.",
            Accommodation = "Posada rural con encanto en Andamarca."
        };

        var it2_2 = new ItineraryDay
        {
            TourId = tour2.Id,
            DayNumber = 2,
            Title = "Danza de las Tijeras y Cabana Sur",
            Description = "Desayuno campesino. Espectacular encuentro privado con maestros de la Danza de las Tijeras, aprendiendo el significado místico del chasquido del acero y la conexión con los Apus. Traslado a Cabana Sur para apreciar su templo colonial y retorno.",
            Activities = "Demostración de danza milenaria, visita a la plaza e iglesia histórica de Cabana Sur.",
            Meals = "Desayuno andino, almuerzo regional.",
            Accommodation = "Fin del tour y retorno a punto inicial."
        };

        var it3_1 = new ItineraryDay
        {
            TourId = tour3.Id,
            DayNumber = 1,
            Title = "Aproximación al Macizo del Qarhuarazo",
            Description = "Traslado en 4x4 hacia las faldas del Apu Qarhuarazo cruzando bofedales de altura. Inicio del trekking gradual hasta el Campamento Base a 4,400 msnm. Avistamiento de manadas de vicuñas protegidas por la comunidad.",
            Activities = "Trekking de aclimatación, armado de campamento, fotografía de atardecer andino.",
            Meals = "Box lunch energético, cena caliente de montaña.",
            Accommodation = "Campamento de alta montaña en carpas térmicas."
        };

        var it3_2 = new ItineraryDay
        {
            TourId = tour3.Id,
            DayNumber = 2,
            Title = "Ascenso a la Cumbre Menor y Ceremonia del Pago",
            Description = "Jornada cumbre. Salida al alba para alcanzar el collado y arista rocosa con vista a los glaciares y a todo el Valle del Sondondo. En la cúspide se realiza el ritual del Pago a la Tierra con hojas sagradas de coca y ofrendas. Descenso seguro.",
            Activities = "Ascenso técnico moderado, meditación y pago a la tierra, descenso al campamento.",
            Meals = "Desayuno de montaña, refrigerio de altura, cena reparadora.",
            Accommodation = "Campamento base o refugio comunal."
        };

        var it3_3 = new ItineraryDay
        {
            TourId = tour3.Id,
            DayNumber = 3,
            Title = "Lagunas Glaciares y Descenso al Valle",
            Description = "Caminata de retorno visitando las lagunas turquesas alimentadas por el deshielo. Despedida del Apu y traslado de regreso al valle para un reconfortante baño termal de despedida.",
            Activities = "Caminata escénica, visita a lagunas, traslado en 4x4.",
            Meals = "Desayuno en campamento, almuerzo de celebración en el valle.",
            Accommodation = "Retorno a la ciudad."
        };

        await context.ItineraryDays.AddRangeAsync(it1_1, it2_1, it2_2, it3_1, it3_2, it3_3);

        // 4. Testimonials
        var t1 = new Testimonial
        {
            AuthorName = "Valeria Monteagudo",
            Location = "Lima, Perú",
            Rating = 5,
            Comment = "El Valle del Sondondo es mágico y casi virgen. Ver a los cóndores volar tan cerca en Mayobamba me sacó lágrimas de la emoción. El equipo de Valle del Sondondo Expeditions cuidó cada detalle, la comida deliciosa y el guía nos hizo sentir en familia.",
            TourName = "Kuntur Ñan: El Majestuoso Vuelo del Cóndor",
            Date = DateTime.UtcNow.AddDays(-15)
        };

        var t2 = new Testimonial
        {
            AuthorName = "Marc & Sophie Dupont",
            Location = "Lyon, Francia",
            Rating = 5,
            Comment = "Una experiencia auténtica, lejos del turismo masivo. Las terrazas de Andamarca son más impresionantes que muchos sitios famosos. La demostración de los danzantes de tijeras fue algo electrizante. ¡100% recomendado!",
            TourName = "Gran Circuito Andenes Vivos de Andamarca",
            Date = DateTime.UtcNow.AddDays(-28)
        };

        var t3 = new Testimonial
        {
            AuthorName = "Carlos Mendoza R.",
            Location = "Arequipa, Perú",
            Rating = 5,
            Comment = "Hicimos la travesía completa de 4 días. Todo el valle es un espectáculo: baños termales limpios, gente entrañable y paisajes infinitos. La logística de transporte y posadas estuvo impecable.",
            TourName = "Gran Travesía Valle del Sondondo",
            Date = DateTime.UtcNow.AddDays(-42)
        };

        await context.Testimonials.AddRangeAsync(t1, t2, t3);
        await context.SaveChangesAsync();
    }
}
