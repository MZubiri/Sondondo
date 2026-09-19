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
            // If DB was already seeded, synchronize existing tours with authentic verified assets
            var existingTours = await context.Tours.ToListAsync();
            bool changed = false;
            foreach (var tour in existingTours)
            {
                var slug = (tour.Slug ?? "").ToLower();
                var title = (tour.Title ?? "").ToLower();

                if (slug.Contains("condor") || title.Contains("cóndor") || title.Contains("condor"))
                {
                    tour.Title = "Kuntur Ñan: El Majestuoso Vuelo del Cóndor";
                    tour.Subtitle = "Avistamiento de hasta 35 cóndores en Mayobamba y descenso al bebedero sagrado";
                    tour.Description = "Vive una experiencia sobrecogedora en el mirador de Mayobamba (3,200 msnm), el mejor lugar del Perú para observar al Apu Huamaní (cóndor andino) en estado silvestre. Por las mañanas, contempla el vuelo de hasta 35 cóndores sobrevolando a pocos metros de distancia conforme salen de sus dormideros y desciende luego al pie del puquial / bebedero en el cañón para observarlos de cerca. Guiado por pobladores originarios quechuas conocedores de los mitos y tradiciones del valle.";
                    tour.AltitudeMax = "3,200 msnm";
                    tour.MainImageUrl = "/assets/images/condor_mayobamba.jpg";
                    tour.GalleryImagesJson = JsonSerializer.Serialize(new[]
                    {
                        "/assets/images/condor_mayobamba.jpg",
                        "/assets/images/bosque_piedras.jpg",
                        "/assets/images/rio_sondondo.jpg"
                    });
                    changed = true;
                }
                else if (slug.Contains("andenes") || title.Contains("andamarca") || title.Contains("tijeras") || title.Contains("caniche"))
                {
                    tour.Title = "Andenes Vivos de Andamarca, Caniche y Danza de Tijeras";
                    tour.Subtitle = "Colosal sistema agrícola preínca Huari e Inca, fortaleza de Caniche y ritual de tijeras";
                    tour.Description = "Recorre las más de 5,000 hectáreas de terrazas agrícolas en uso continuo de Andamarca (3,300 msnm). Explora el Sitio Arqueológico de Caniche (Patrimonio de la Nación 2003) con sus murallas Wari de hasta 12 metros de altura, colcas y cantería ceremonial incaica. Participa en labores tradicionales de siembra y riego, culminando con una demostración íntima de la Danza de las Tijeras (Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO).";
                    tour.AltitudeMax = "3,459 msnm";
                    tour.MainImageUrl = "/assets/images/andenes_andamarca.jpg";
                    tour.GalleryImagesJson = JsonSerializer.Serialize(new[]
                    {
                        "/assets/images/andenes_andamarca.jpg",
                        "/assets/images/danza_tijeras.jpg",
                        "/assets/images/pueblo_andamarca.jpg"
                    });
                    changed = true;
                }
                else if (slug.Contains("volcan") || slug.Contains("pachapupum") || slug.Contains("termal") || title.Contains("termal") || title.Contains("termas") || title.Contains("qollpa"))
                {
                    tour.Title = "Minivolcanes de Pachapupum & Termas Medicinales";
                    tour.Subtitle = "Monumento pétreo volcánico de sal y azufre a 4,022 msnm y pozas termomedicinales";
                    tour.Description = "Monumento natural cónico de sal y azufre de 30 metros de altura con cráter de aguas termales en ebullición y pozas termomedicinales curativas ricas en minerales, ubicado en Sacsamarca y en los cañones del río Sondondo.";
                    tour.AltitudeMax = "4,022 msnm";
                    tour.MainImageUrl = "/assets/images/volcan_pachapupum.jpg";
                    tour.GalleryImagesJson = JsonSerializer.Serialize(new[]
                    {
                        "/assets/images/volcan_pachapupum.jpg",
                        "/assets/images/rio_sondondo.jpg",
                        "/assets/images/bosque_piedras.jpg"
                    });
                    changed = true;
                }
                else if (slug.Contains("qarhuarazo") || slug.Contains("pampa") || slug.Contains("galeras") || title.Contains("qarhuarazo") || title.Contains("vicuña"))
                {
                    tour.Title = "Trek Pampa Galeras & Bofedales del Apu Qarhuarazo";
                    tour.Subtitle = "Travesía por la Reserva Nacional Pampa Galeras, manadas de vicuñas y nevado tutelar";
                    tour.Description = "En el km 90 de la vía se encuentra la Reserva Nacional Bárbara d'Achille Pampa Galeras, que alberga la mayor población de vicuñas del país. Travesía de alta montaña por bofedales y pastizales andinos bajo la protección del nevado Apu Qarhuarazo.";
                    tour.AltitudeMax = "4,800 msnm";
                    tour.MainImageUrl = "/assets/images/pampa_galeras_vicunas.jpg";
                    tour.GalleryImagesJson = JsonSerializer.Serialize(new[]
                    {
                        "/assets/images/pampa_galeras_vicunas.jpg",
                        "/assets/images/pueblo_andamarca.jpg",
                        "/assets/images/rio_sondondo.jpg"
                    });
                    changed = true;
                }
                else
                {
                    tour.Title = "Gran Travesía Valle del Sondondo: Ruta de la Mancomunidad";
                    tour.Subtitle = "La expedición definitiva por los seis distritos ancestrales de los Hurin Rukanas";
                    tour.Description = "La travesía integral más completa de los Andes ayacuchanos a través de la mancomunidad de seis distritos (Andamarca, Aucará, Cabana Sur, Chipao, Mayobamba y Sondondo). Combina el avistamiento matutino de cóndores, las terrazas vivas de Andamarca, la fortaleza de Caniche, los baños termales de Qollpa, la laguna de Qochapampa y la casa de Guaman Poma de Ayala, con guías nativos quechuahablantes.";
                    tour.AltitudeMax = "3,459 msnm";
                    tour.MainImageUrl = "/assets/images/hero_sondondo.jpg";
                    tour.GalleryImagesJson = JsonSerializer.Serialize(new[]
                    {
                        "/assets/images/hero_sondondo.jpg",
                        "/assets/images/andenes_andamarca.jpg",
                        "/assets/images/condor_mayobamba.jpg",
                        "/assets/images/danza_tijeras.jpg"
                    });
                    changed = true;
                }
            }

            if (changed)
            {
                await context.SaveChangesAsync();
            }
            return; // DB has been synchronized
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
            Name = "Alta Montaña & Vicuñas",
            Slug = "alta-montana-vicunas",
            Description = "Reserva Nacional Pampa Galeras, vicuñas silvestres y ascensos al Apu Qarhuarazo.",
            Icon = "mountain",
            DisplayOrder = 3
        };

        var catTermal = new Category
        {
            Name = "Aguas Termales & Cañones",
            Slug = "aguas-termales-canones",
            Description = "Relax medicinal en fuentes termales naturales de Pachapupum y cañones de Chipao.",
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
            Subtitle = "Avistamiento de hasta 35 cóndores en Mayobamba y descenso al bebedero sagrado",
            Description = "Vive una experiencia sobrecogedora en el mirador de Mayobamba (3,200 msnm), el mejor lugar del Perú para observar al Apu Huamaní (cóndor andino) en estado silvestre. Por las mañanas, contempla el vuelo de hasta 35 cóndores sobrevolando a pocos metros de distancia conforme salen de sus dormideros y desciende luego al pie del puquial / bebedero en el cañón para observarlos de cerca. Guiado por pobladores originarios quechuas conocedores de los mitos y tradiciones del valle.",
            CategoryId = catCondor.Id,
            Duration = "Full Day (8:00 AM - 4:30 PM)",
            DurationDays = 1,
            PriceSoles = 140.00m,
            PriceUsd = 38.00m,
            Difficulty = "Fácil a Moderado",
            AltitudeMax = "3,200 msnm",
            StartingPoint = "Aucará / Puquio / Cabana Sur",
            Featured = true,
            DisplayOrder = 1,
            MainImageUrl = "/assets/images/condor_mayobamba.jpg",
            GalleryImagesJson = JsonSerializer.Serialize(new[]
            {
                "/assets/images/condor_mayobamba.jpg",
                "/assets/images/bosque_piedras.jpg",
                "/assets/images/rio_sondondo.jpg"
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
            Title = "Andenes Vivos de Andamarca, Caniche y Danza de Tijeras",
            Slug = "andenes-vivos-andamarca-danzantes-de-tijeras",
            Subtitle = "Colosal sistema agrícola preínca Huari e Inca, fortaleza de Caniche y ritual de tijeras",
            Description = "Recorre las más de 5,000 hectáreas de terrazas agrícolas en uso continuo de Andamarca (3,300 msnm). Explora el Sitio Arqueológico de Caniche (Patrimonio de la Nación 2003) con sus murallas Wari de hasta 12 metros de altura, colcas y cantería ceremonial incaica. Participa en labores tradicionales de siembra y riego, culminando con una demostración íntima de la Danza de las Tijeras (Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO).",
            CategoryId = catCultura.Id,
            Duration = "2 Días / 1 Noche",
            DurationDays = 2,
            PriceSoles = 320.00m,
            PriceUsd = 88.00m,
            Difficulty = "Fácil a Moderado",
            AltitudeMax = "3,459 msnm",
            StartingPoint = "Puquio o Aucará",
            Featured = true,
            DisplayOrder = 2,
            MainImageUrl = "/assets/images/andenes_andamarca.jpg",
            GalleryImagesJson = JsonSerializer.Serialize(new[]
            {
                "/assets/images/andenes_andamarca.jpg",
                "/assets/images/danza_tijeras.jpg",
                "/assets/images/pueblo_andamarca.jpg"
            }),
            IncludedJson = JsonSerializer.Serialize(new[]
            {
                "Transporte en minivan turística privada durante todo el recorrido",
                "1 Noche de alojamiento en posada rural con encanto en Andamarca",
                "Alimentación completa (1 desayuno, 2 almuerzos andinos, 1 cena)",
                "Demostración vivencial de Danza de las Tijeras con maestro galas",
                "Guiado histórico e interpretación cultural por expertos comunales",
                "Boletos de ingreso al complejo arqueológico de Caniche",
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
                "Batería externa para teléfono/cámara",
                "Dinero en efectivo en soles (no hay cajeros ATM en Andamarca)"
            })
        };

        var tour3 = new Tour
        {
            Title = "Minivolcanes de Pachapupum & Termas Medicinales",
            Slug = "volcan-pachapupum-termas-mayobamba",
            Subtitle = "Monumento pétreo volcánico de sal y azufre a 4,022 msnm y pozas termomedicinales",
            Description = "Monumento natural cónico de sal y azufre de 30 metros de altura con cráter de aguas termales en ebullición y pozas termomedicinales curativas ricas en minerales, ubicado en Sacsamarca y en los cañones del río Sondondo.",
            CategoryId = catTermal.Id,
            Duration = "Full Day (8:30 AM - 5:00 PM)",
            DurationDays = 1,
            PriceSoles = 130.00m,
            PriceUsd = 36.00m,
            Difficulty = "Fácil",
            AltitudeMax = "4,022 msnm",
            StartingPoint = "Sacsamarca / Chipao, Lucanas",
            Featured = false,
            DisplayOrder = 3,
            MainImageUrl = "/assets/images/volcan_pachapupum.jpg",
            GalleryImagesJson = JsonSerializer.Serialize(new[]
            {
                "/assets/images/volcan_pachapupum.jpg",
                "/assets/images/rio_sondondo.jpg",
                "/assets/images/bosque_piedras.jpg"
            }),
            IncludedJson = JsonSerializer.Serialize(new[]
            {
                "Transporte turístico privado para todo el itinerario",
                "Entrada a las pozas termales medicinales de Pachapupum",
                "Guía local conocedor de las propiedades botánicas y minerales",
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
                "Ropa ligera para el día y un abrigo para el retorno",
                "Bolsa impermeable para dispositivos móviles"
            })
        };

        var tour4 = new Tour
        {
            Title = "Trek Pampa Galeras & Bofedales del Apu Qarhuarazo",
            Slug = "apu-qarhuarazo-pampa-galeras",
            Subtitle = "Travesía por la Reserva Nacional Pampa Galeras, manadas de vicuñas y nevado tutelar",
            Description = "En el km 90 de la vía se encuentra la Reserva Nacional Bárbara d'Achille Pampa Galeras, que alberga la mayor población de vicuñas del país. Travesía de alta montaña por bofedales y pastizales andinos bajo la protección del nevado Apu Qarhuarazo.",
            CategoryId = catMontana.Id,
            Duration = "2 Días",
            DurationDays = 2,
            PriceSoles = 180.00m,
            PriceUsd = 49.00m,
            Difficulty = "Exigente",
            AltitudeMax = "4,800 msnm",
            StartingPoint = "Pampa Galeras / Lucanas, Ayacucho",
            Featured = false,
            DisplayOrder = 4,
            MainImageUrl = "/assets/images/pampa_galeras_vicunas.jpg",
            GalleryImagesJson = JsonSerializer.Serialize(new[]
            {
                "/assets/images/pampa_galeras_vicunas.jpg",
                "/assets/images/pueblo_andamarca.jpg",
                "/assets/images/rio_sondondo.jpg"
            }),
            IncludedJson = JsonSerializer.Serialize(new[]
            {
                "Transporte turístico privado para todo el circuito",
                "Ingreso a la Reserva Nacional Pampa Galeras",
                "Guía de montaña local con botiquín y oxígeno",
                "Alimentación completa durante la expedición"
            }),
            NotIncludedJson = JsonSerializer.Serialize(new[]
            {
                "Gastos personales adicionales"
            }),
            RecommendationsJson = JsonSerializer.Serialize(new[]
            {
                "Ropa térmica de abrigo para puna alta",
                "Zapatos de trekking y protección solar"
            })
        };

        var tour5 = new Tour
        {
            Title = "Gran Travesía Valle del Sondondo: Ruta de la Mancomunidad",
            Slug = "gran-travesia-valle-del-sondondo",
            Subtitle = "La expedición definitiva por los seis distritos ancestrales de los Hurin Rukanas",
            Description = "La travesía integral más completa de los Andes ayacuchanos a través de la mancomunidad de seis distritos (Andamarca, Aucará, Cabana Sur, Chipao, Mayobamba y Sondondo). Combina el avistamiento matutino de cóndores, las terrazas vivas de Andamarca, la fortaleza de Caniche, los baños termales, la laguna y el pueblo tradicional, con guías nativos quechuahablantes.",
            CategoryId = catCultura.Id,
            Duration = "4 Días / 3 Noches",
            DurationDays = 4,
            PriceSoles = 720.00m,
            PriceUsd = 195.00m,
            Difficulty = "Moderado",
            AltitudeMax = "3,459 msnm",
            StartingPoint = "Puquio, Nasca o Ayacucho",
            Featured = true,
            DisplayOrder = 5,
            MainImageUrl = "/assets/images/hero_sondondo.jpg",
            GalleryImagesJson = JsonSerializer.Serialize(new[]
            {
                "/assets/images/hero_sondondo.jpg",
                "/assets/images/andenes_andamarca.jpg",
                "/assets/images/condor_mayobamba.jpg",
                "/assets/images/danza_tijeras.jpg"
            }),
            IncludedJson = JsonSerializer.Serialize(new[]
            {
                "Transporte privado exclusivo durante los 4 días de expedición",
                "3 noches de alojamiento en hoteles y posadas turísticas seleccionadas",
                "Todas las comidas incluidas (desayunos, almuerzos campestres, cenas)",
                "Guía oficial de turismo residente con amplia experiencia en la zona",
                "Ingresos a todos los atractivos, miradores, termas y sitios arqueológicos",
                "Noche cultural con música andina tradicional en vivo",
                "Seguro de asistencia médica local y botiquín completo"
            }),
            NotIncludedJson = JsonSerializer.Serialize(new[]
            {
                "Pasajes aéreos o interprovinciales hasta Puquio/Nasca (podemos coordinar traslados)"
            }),
            RecommendationsJson = JsonSerializer.Serialize(new[]
            {
                "Llevar maleta pequeña o mochila de 40L para mayor comodidad en traslados",
                "Llevar dinero en efectivo en soles (único banco en Cabana)",
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
            Title = "Mirador de Mayobamba y Cañón del Cóndor",
            Description = "Partida temprana hacia el mirador natural de Mayobamba. Despliegue de binoculares para observar el vuelo de hasta 35 cóndores andinos sobrevolando a pocos metros en su hábitat silvestre.",
            Activities = "Avistamiento ornitológico de cóndores, visita al cañón, mitos del Apu Huamaní e interpretación de flora.",
            Meals = "Almuerzo campestre andino, mates calientes de hierbas medicinales.",
            Accommodation = "Retorno al pueblo de origen al finalizar la tarde."
        };

        var it2_1 = new ItineraryDay
        {
            TourId = tour2.Id,
            DayNumber = 1,
            Title = "Andenes Prehispánicos de Andamarca y Sitio Arqueológico Caniche",
            Description = "Salida hacia Andamarca. Recorrido vivencial por el colosal sistema de andenes en uso agrícola. Ascenso al complejo arqueológico de Caniche para apreciar sus murallas Wari de 12 metros, colcas y cantería ceremonial inca.",
            Activities = "Caminata por terrazas vivas, exploración arqueológica de Caniche y diálogo con agricultores sobre agrobiodiversidad.",
            Meals = "Almuerzo típico en Andamarca, cena comunitaria tradicional.",
            Accommodation = "Posada rural con encanto en Andamarca."
        };

        var it2_2 = new ItineraryDay
        {
            TourId = tour2.Id,
            DayNumber = 2,
            Title = "Danza de las Tijeras y Cabana Sur",
            Description = "Desayuno campesino. Demostración vivencial de la Danza de las Tijeras con maestro galas. Traslado a Cabana Sur para apreciar su templo colonial y la plaza histórica.",
            Activities = "Demostración de danza milenaria (Patrimonio UNESCO), visita histórica a Cabana Sur.",
            Meals = "Desayuno andino, almuerzo regional.",
            Accommodation = "Fin del tour y retorno al punto de inicio."
        };

        await context.ItineraryDays.AddRangeAsync(it1_1, it2_1, it2_2);

        // 4. Testimonials
        var t1 = new Testimonial
        {
            AuthorName = "Valeria Monteagudo",
            Location = "Lima, Perú",
            Rating = 5,
            Comment = "El Valle del Sondondo es mágico y casi virgen. Ver a los cóndores volar tan cerca en Mayobamba y luego observarlos en el cañón me sacó lágrimas de la emoción. El equipo local cuidó cada detalle y la comida deliciosa.",
            TourName = "Kuntur Ñan: El Majestuoso Vuelo del Cóndor",
            Date = DateTime.UtcNow.AddDays(-15)
        };

        var t2 = new Testimonial
        {
            AuthorName = "Marc & Sophie Dupont",
            Location = "Lyon, Francia",
            Rating = 5,
            Comment = "Una experiencia auténtica, lejos del turismo masivo. Las terrazas vivas de Andamarca y la imponente fortaleza de Caniche con sus murallas de 12 metros son más impresionantes que muchos sitios famosos. ¡100% recomendado!",
            TourName = "Andenes Vivos de Andamarca, Caniche y Danza de Tijeras",
            Date = DateTime.UtcNow.AddDays(-28)
        };

        var t3 = new Testimonial
        {
            AuthorName = "Carlos Mendoza R.",
            Location = "Arequipa, Perú",
            Rating = 5,
            Comment = "Hicimos la travesía completa de 4 días por toda la mancomunidad. Los baños termales de Pachapupum, las vicuñas de Pampa Galeras y los andenes de Andamarca nos fascinaron.",
            TourName = "Gran Travesía Valle del Sondondo",
            Date = DateTime.UtcNow.AddDays(-42)
        };

        await context.Testimonials.AddRangeAsync(t1, t2, t3);
        await context.SaveChangesAsync();
    }
}
